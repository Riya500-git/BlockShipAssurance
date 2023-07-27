# Smart Contract Part for BlockShipAssurance
This is hardhat project to test and deploy the CamoSuperParcel Contract required by BlockShipAssurance.

## To Run
- Provide PRIVATE_KEY in the .env file (You can look at .example.env).
- Change `TOKEN_ADDR` (SuperToken) and `shipper_fee` (flow rate per second) as per your requirement
- Use `npx hardhat run scripts/1_deploy_camo_super_parcel.js` to deploy your contract 
- Use `npx hardhat test` to test the contract.