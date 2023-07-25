import { ethers } from "ethers";

import { Framework } from "@superfluid-finance/sdk-core";


const addrParcel = "0x00334420c3B43F9E0BAaC3C1CfeCf041d0d4d9c1"
// "0x19521de75582E91BF9aaD0DB7Bd2296ca5A2b00d"
const UserType = Object.freeze({
	SHIPPER: 1,
	PARTNER: 2,
	OWNER: 999,
	NONE: 3
});


const ShipperType = Object.freeze({
	ACTIVE: "1",
	INACTIVE: "2",
	BANNED: "3"
})

const DEBUG = false;
const TESTING_USER_TYPE = UserType.SHIPPER;

const CHAIN_PARAMS = {
	chainId: "0x13881",
	chainName: "Mumbai Testnet",
	nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
	rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
	blockExplorerUrls: ["https://polygonscan.com/"],
};


const QRCode = require('qrcode');

const generateQRCode = async (text) => {
	try {
		const dataUrl = await QRCode.toDataURL(text);
		return dataUrl;
	} catch (error) {
		console.error(error);
	}
};

const getMyId = async (camoParcelInstance) => {
	try {
		let result = (await camoParcelInstance.methods.getMyId().call({ from: window.web3.currentProvider.selectedAddress })).toString();
		console.log("id is:- ", result);
		return result;
	} catch (error) {
		console.error(error)
	}
}

const getShipperById = async (camoParcelInstance, pId) => {
	try {
		let result = await camoParcelInstance.methods.getShipperById(pId).call({ from: window.web3.currentProvider.selectedAddress });
		console.log(result);
		return result;
	} catch (error) {
		console.error(error)
	}
}
const registerAsShipper = async (camoParcelInstance) => {
	try {
		await updateFlowPermissions(addrParcel, "1000000000000000", "7");
		let result = await camoParcelInstance.methods.registerAsShipper().send({ from: window.web3.currentProvider.selectedAddress });
		console.info("result: ", result);
	} catch (error) {
		console.error(error);
	}
}

async function updateFlowPermissions(
	operator,
	flowRateAllowance,
	permissionType
) {
	const provider = new ethers.providers.Web3Provider(window.ethereum);
	await provider.send("eth_requestAccounts", []);

	const signer = provider.getSigner();

	const chainId = await window.ethereum.request({ method: "eth_chainId" });
	const sf = await Framework.create({
		chainId: Number(chainId),
		provider: provider
	});

	const superSigner = sf.createSigner({ signer: signer });

	console.log(signer);
	console.log(await superSigner.getAddress());
	const daix = await sf.loadSuperToken("MATICx");

	console.log(daix);

	try {
		const updateFlowOperatorOperation = daix.updateFlowOperatorPermissions({
			flowOperator: operator,
			permissions: permissionType,
			flowRateAllowance: flowRateAllowance
			// userData?: string
		});

		console.log("Updating your flow permissions...");

		const result = await updateFlowOperatorOperation.exec(signer);
		console.log(result);

		console.log(
			`
    Super Token: DAIx
    Operator: ${operator}
    Permission Type: ${permissionType},
    Flow Rate Allowance: ${flowRateAllowance}
    `
		);
	} catch (error) {
		console.log(
			"Hmmm, your transaction threw an error. Make sure that this stream does not already exist, and that you've entered a valid Ethereum address!"
		);
		console.error(error);
	}
}

const unregisterAsShipper = async (camoParcelInstance) => {
	try {
		let result = await camoParcelInstance.methods.unregisterAsShipper().send({ from: window.web3.currentProvider.selectedAddress });
		console.info("result: ", result);
	} catch (error) {
		console.error(error);
	}
}

const addPartner = async (camoParcelInstance, partner_address, salary) => {
	try {
		let result = await camoParcelInstance.methods.addPartner(partner_address, salary).send({ from: window.web3.currentProvider.selectedAddress });
		console.info("result: ", result);
		// TODO show toast that partner has been added
	} catch (error) {
		console.error(error);
	}
}

const shipperDepositFund = async (camoParcelInstance, amount) => {
	try {
		// TODO approve
		let result = await camoParcelInstance.methods.shipperDepositFund(amount).send({ from: window.web3.currentProvider.selectedAddress });
		console.info("result: ", result);
	} catch (error) {
		console.error(error);
	}
}

export { addrParcel, CHAIN_PARAMS, UserType, ShipperType, DEBUG, TESTING_USER_TYPE, generateQRCode, getMyId, getShipperById, registerAsShipper, unregisterAsShipper, addPartner, shipperDepositFund }