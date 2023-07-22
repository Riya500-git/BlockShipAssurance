const { ethers } = require("hardhat");
const TOKEN_ADDR = "0x96B82B65ACF7072eFEb00502F45757F254c2a0D4";
const shipper_fee = 32705389848;

// 0xb223b72acd3f5d636dac6f5b9a09a3063bbb6f54


async function main() {
	const CamoSuperParcel = await ethers.getContractFactory("CamoSuperParcel");
	const camoSuperParcel = await CamoSuperParcel.deploy(TOKEN_ADDR, shipper_fee);
	await camoSuperParcel.deployed();
	console.log("Success contract was deployed to: ", camoSuperParcel.address)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
