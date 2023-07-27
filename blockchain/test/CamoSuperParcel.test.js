const { expect } = require("chai")
const { Framework } = require("@superfluid-finance/sdk-core")
const { ethers } = require("hardhat")
const { deployTestFramework } = require("@superfluid-finance/ethereum-contracts/dev-scripts/deploy-test-framework");
const TestToken = require("@superfluid-finance/ethereum-contracts/build/contracts/TestToken.json");
const { BigNumber } = require("ethers");


let sfDeployer
let contractsFramework
let sf
let camoSuperParcel
let dai
let daix

// Test Accounts
let owner
let owner_address
let account1
let account1_address
let account2
let account2_address
let account3
let account3_address
let shipperFee = 2500
let partnerSalary = 2500
const thousandEther = ethers.utils.parseEther("10000")

const TYPE_SHIPPER = 1;
const TYPE_PARTNER = 2;
const TYPE_DEFAULT = 3;
const TYPE_OWNER = 999;
const P_STATUS_DISPATCHED = 1;
const P_STATUS_IN_TRANSIT = 2;
const P_STATUS_DELIVERED = 3;


before(async function () {

	// get hardhat accounts
	[owner, account1, account2, account3] = await ethers.getSigners();
	owner_address = await owner.getAddress();
	account1_address = await account1.getAddress();
	account2_address = await account2.getAddress();
	account3_address = await account3.getAddress();
	sfDeployer = await deployTestFramework();

	// GETTING SUPERFLUID FRAMEWORK SET UP

	// deploy the framework locally
	contractsFramework = await sfDeployer.frameworkDeployer.getFramework()

	// initialize framework
	sf = await Framework.create({
		chainId: 31337,
		provider: owner.provider,
		resolverAddress: contractsFramework.resolver, // (empty)
		protocolReleaseVersion: "test"
	})

	// DEPLOYING DAI and DAI wrapper super token (which will be our `spreaderToken`)
	tokenDeployment = await sfDeployer.frameworkDeployer.deployWrapperSuperToken(
		"Fake DAI Token",
		"fDAI",
		18,
		ethers.utils.parseEther("100000000").toString()
	)

	daix = await sf.loadSuperToken("fDAIx")
	dai = new ethers.Contract(
		daix.underlyingToken.address,
		TestToken.abi,
		owner
	)
});

beforeEach(async function () {
	// minting test DAI
	await dai.mint(owner.address, thousandEther)
	await dai.mint(account1.address, thousandEther)
	await dai.mint(account2.address, thousandEther)

	// approving DAIx to spend DAI (Super Token object is not an ethers contract object and has different operation syntax)
	await dai.approve(daix.address, ethers.constants.MaxInt256)
	await dai
		.connect(account1)
		.approve(daix.address, ethers.constants.MaxInt256)
	await dai
		.connect(account2)
		.approve(daix.address, ethers.constants.MaxInt256)
	// Upgrading all DAI to DAIx
	const ownerUpgrade = daix.upgrade({ amount: thousandEther });
	const account1Upgrade = daix.upgrade({ amount: thousandEther });
	const account2Upgrade = daix.upgrade({ amount: thousandEther });

	await ownerUpgrade.exec(owner)
	await account1Upgrade.exec(account1)
	await account2Upgrade.exec(account2)

	await deployCamoParcel()
})

async function deployCamoParcel() {
	let CamoSuperParcel = await ethers.getContractFactory("CamoSuperParcel", owner)

	camoSuperParcel = await CamoSuperParcel.deploy(
		daix.address,
		shipperFee
	)
	await camoSuperParcel.deployed()
}

describe("CamoSuperParcel", function () {
	it("#1 - Should deploy properly with the correct owner", async function () {
		expect(await camoSuperParcel.owner()).to.equal(owner.address)
	})

	it("#2 -register, unregister shipper", async function () {
		await makeShipper(camoSuperParcel, account1);

		let myType = await camoSuperParcel.connect(account1).getMyType();
		let myId = (await camoSuperParcel.connect(account1).getMyId()).toString();

		let shipper_address = account1_address;
		let flow = await daix.getFlow({
			sender: shipper_address,
			receiver: camoSuperParcel.address,
			providerOrSigner: owner
		})

		expect(flow.flowRate).to.equal(shipperFee.toString());
		expect(myType).to.equal(TYPE_SHIPPER);
		expect(myId).to.equal("1");
		let shipper = await camoSuperParcel.connect(owner).getShipperById(myId);
		expect(shipper.status).to.equal(1);

		// Unregister shipper
		await camoSuperParcel.connect(account1).unregisterAsShipper();
		shipper = await camoSuperParcel.connect(owner).getShipperById(myId);
		flow = await daix.getFlow({
			sender: shipper_address,
			receiver: camoSuperParcel.address,
			providerOrSigner: owner
		});

		expect(shipper.status).to.equal(2);
		expect(flow.flowRate).to.equal("0");
	})

	it("#3 - Shipper adds, removes a partner", async function () {

		await makeShipper(camoSuperParcel, account1);
		let partner_address = account2_address;
		let shipper_address = account1_address;
		await addPartner(camoSuperParcel, account1, partner_address, partnerSalary);
		let partnerType = await camoSuperParcel.connect(account2).getMyType();
		let partnerId = (await camoSuperParcel.connect(account2).getMyId()).toString();
		let myPartners = await camoSuperParcel.connect(account1).viewMyPartners();
		let flow = await daix.getFlow({
			sender: shipper_address,
			receiver: partner_address,
			providerOrSigner: owner
		})

		expect(partnerType).to.equal(TYPE_PARTNER);
		expect(myPartners[0].active).to.equal(true);
		expect(partnerId).to.equal("1");
		expect(myPartners.length).to.equal(1);
		expect(flow.flowRate).to.equal(partnerSalary.toString());

		await camoSuperParcel.connect(account1).removePartner(partner_address);

		let partner = await camoSuperParcel.connect(account1).getMyPartnerById(partnerId);

		expect(partner.active).to.equal(false);
	})

	it("#4 - Ship order", async function () {
		await makeShipper(camoSuperParcel, account1);
		await addPartner(camoSuperParcel, account1, account2_address, partnerSalary);

		await daix.approve({ receiver: camoSuperParcel.address, amount: ethers.utils.parseEther("5") }).exec(account1);

		await camoSuperParcel.connect(account1).shipperDepositFund(5);
		let shipper = await camoSuperParcel.connect(account1).getShipperById(1);
		await camoSuperParcel.connect(account1).shipOrder("item1", "item desc", account3_address, getCurrentUnixTimestamp() + 60 * 60 * 48, 1, 1234);
		let shippedParcels = await camoSuperParcel.connect(account1).viewMyParcels();
		expect(shippedParcels.length).to.equal(1);
		let parcel = shippedParcels[shippedParcels.length - 1];
		expect(parcel.status.toNumber()).to.equal(P_STATUS_DISPATCHED);

		await camoSuperParcel.connect(account2).updateLocation(parcel.id, "location 1");

		parcel = await camoSuperParcel.connect(account1).viewParcel(parcel.id);

		expect(parcel.currentLocation).to.equal("location 1");
		expect(parcel.status.toNumber()).to.equal(P_STATUS_IN_TRANSIT);

		await camoSuperParcel.connect(account2).markParcelDelivered(parcel.id, 1234);
		parcel = await camoSuperParcel.connect(account1).viewParcel(parcel.id);
		expect(parcel.status.toNumber()).to.equal(P_STATUS_DELIVERED);

		await camoSuperParcel.connect(account3).rateDeliveredParcel(parcel.id, 4);
		parcel = await camoSuperParcel.connect(account1).viewParcel(parcel.id);
		expect(parcel.rating.toNumber()).to.equal(4);

		shipper = await camoSuperParcel.connect(account3).getShipperById(1);
		expect(shipper.totalRated.toNumber()).to.equal(1);
		expect(shipper.rating.toString()).to.equal("4000000000000000000");

		let myParcels = await camoSuperParcel.connect(account3).viewMyParcels();
		expect(myParcels.length).to.equal(1);
	})

})
function getCurrentUnixTimestamp() {
	return Math.floor(Date.now() / 1000);
}

async function makeShipper(camoSuperParcel, account) {
	let authorizeContractOperation = daix.updateFlowOperatorPermissions(
		{
			flowOperator: camoSuperParcel.address,
			permissions: "7", //full control
			flowRateAllowance: "1000000000000000" // ~2500 per month
		}
	)
	await authorizeContractOperation.exec(account);
	await camoSuperParcel.connect(account).registerAsShipper()
}

async function addPartner(camoSuperParcel, shipper_account, partner_address, salary) {
	await camoSuperParcel.connect(shipper_account).addPartner(partner_address, salary);

}