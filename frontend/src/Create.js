import React, { useState } from "react";
import { Box, Button, Textarea, Input, ChakraProvider } from '@chakra-ui/react';
import { UserType } from "./utils";

// import { addrParcel, CHAIN_PARAMS, DEFAULT_USER_TYPE, TYPE_SHIPPER, TYPE_PARTNER, TYPE_OWNER } from './utils';

const Create = ({ connectedAddress, myType, registerAsShipper, unregisterAsShipper, shipOrder }) => {
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [expectedDelivery, setExpectedDeliverey] = useState('');
  const [baseCompensation, setBaseConpensation] = useState('');

  const ship = () => {
    console.log("itemName:", itemName);
    console.log("itemDesc:", itemDesc);
    console.log("userAddress:", userAddress);
    console.log("expectedDelivery:", expectedDelivery);
    console.log("baseCompensation:", baseCompensation);

    const targetDate = expectedDelivery;

    // Create a new Date object for the current time
    const date = new Date();

    // Split the target date into year, month, and day
    const [year, month, day] = targetDate.split('-');

    // Set the year, month, and date of the Date object
    date.setFullYear(year);
    date.setMonth(month - 1); // Month is 0-indexed
    date.setDate(day);

    // Convert the Date object to a Unix timestamp
    const timestamp = Math.ceil(date.getTime() / 1000);

    const generateOTP = () => {
      let otp = Math.floor(100000 + Math.random() * 900000);
      return otp.toString();
    };

    const otp = generateOTP();

    shipOrder(itemName, itemDesc, userAddress, timestamp, baseCompensation, otp);
  }

  const register = () => {
    registerAsShipper();
  }

  const unregister = () => {
    console.info("unregisterAsShipper() called");
    unregisterAsShipper();
  }

  return (
    <ChakraProvider>
      <Box>
        <br />
        {
          myType === UserType.SHIPPER &&
          <Box
            display="flex"
            flexDirection="column"
            height="100vh"
            backgroundColor="rgba(25, 255, 255, 0.5)"
            backdropFilter="blur(10px)"
            justifyContent="center"
            alignItems="center"
            padding="50px"
            marginTop="0px"
          >
            <Box
              display="flex"
              flexDirection="column"
              width="700px"
              backgroundColor="#FFFFFF"
              borderRadius="18px"
              padding="40px"
              boxShadow="0 4px 6px rgba(0, 0, 0, 0.4)"
              margin="0 auto"
            >
              <h2 fontSize="24px" fontFamily="DM Sans" fontWeight="700" color="#141414" marginTop="0px">
                Create New Shipment
              </h2>
              <form
                className="section"
                onSubmit={(event) => event.preventDefault()}
              >
                <Box className="form-field" marginBottom="20px">
                  <label htmlFor="itemName">Item Name</label>
                  <Input
                    type="text"
                    id="itemName"
                    className="name-input"
                    placeholder="Item Name"
                    onChange={(event) => setItemName(event.target.value)}
                  />
                </Box>
                <Box className="form-field" marginBottom="20px">
                  <label htmlFor="itemDescription">Item Description</label>
                  <Textarea
                    id="itemDescription"
                    className="description-input"
                    placeholder="Write a suitable description of item."
                    onChange={(event) => setItemDesc(event.target.value)}
                  />
                </Box>
                <Box className="form-field" marginBottom="20px">
                  <label htmlFor="walletAddress">Wallet Address</label>
                  <Input
                    type="text"
                    id="walletAddress"
                    className="name-input"
                    placeholder="Receiver's Wallet address"
                    onChange={(event) => setUserAddress(event.target.value)}
                  />
                </Box>
                <Box className="form-field" marginBottom="20px">
                  <label htmlFor="expectedDeliveryDate">Expected Delivery Date</label>
                  <Input
                    type="date"
                    id="expectedDeliveryDate"
                    onChange={(event) => setExpectedDeliverey(event.target.value)}
                  />
                </Box>
                <Box className="form-field" marginBottom="10px">
                  <label htmlFor="compensationAmount">Compensation Amount</label>
                  <Input
                    type="text"
                    id="compensationAmount"
                    className="name-input"
                    placeholder="Compensation Price in cUSD"
                    onChange={(event) => setBaseConpensation(event.target.value.toString() + "000000000000000000")}
                  />
                </Box>
                <Button
                  type="submit"
                  className="create-button"
                  onClick={ship}
                  position="relative"
                  left='230px'
                  color="#fff"
                  border="none"
                  cursor="pointer"
                  padding="16px"
                  width="150px"
                  height="40px"
                  background="linear-gradient(90.69deg, #2472ff -22.6%, #7e51db 86.31%)"
                  borderRadius="8px"
                  marginTop="10px"
                >
                  Create Request
                </Button>

                </form>
                <Button onClick={unregister} alignSelf="flex-end" marginTop="10px">Unregister As Shipper</Button>
            </Box>
          </Box>
        }
        {
          myType === UserType.NONE &&
          <Box>
            <Button onClick={register}>Register As Shipper</Button>
          </Box>
        }
      </Box>
    </ChakraProvider>
  );
};

export default Create;
