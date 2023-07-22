const addrParcel = "0x19521de75582E91BF9aaD0DB7Bd2296ca5A2b00d"
// "0xb223b72acd3f5d636dac6f5b9a09a3063bbb6f54"
const UserType = Object.freeze({
	SHIPPER: 1,
	PARTNER: 2,
	OWNER: 999,
	NONE: 3
});


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

export { addrParcel, CHAIN_PARAMS, UserType, DEBUG, TESTING_USER_TYPE, generateQRCode }