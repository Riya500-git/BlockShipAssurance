import React, { useState } from 'react';
import { Box, ChakraProvider, Button } from '@chakra-ui/react';
import { FaStar } from 'react-icons/fa';


const List = ({ connectedAddress, myType, myParcels }) => {
  const getStatusString = (status_) => {
    if (status_ === "0") return "Dispatched";
    else if (status_ === "1") return "In Transit";
    else if (status_ === "2") return "Delivered";
    return "Failed";
  };
  const parcels = myParcels;

    const [selectedRating, setSelectedRating] = useState(0);

    const handleRatingChange = (rating) => {
      setSelectedRating(rating);
    };
  

  return (
    <ChakraProvider>
    <Box
      display="grid"
      gridTemplateColumns="repeat(auto-fit, minmax(350px, 1fr))"
      gap="50px"
      padding="150px"
      backdropFilter="blur(10px)"
      backgroundColor="rgba(25, 255, 255, 0.5)"
      height="100vh"
      marginTop="0"
    >
      {/* {parcels.map((parcel) => ( */}
        <Box
          // key={parcel.id.toString()}
          width="100%"
          height="auto"
          padding="20px"
          backgroundColor="#ffffff"
          border="0px solid #dddddd"
          borderRadius="8px"
          flexDirection="column"
        >
          <h2 fontSize="20px" marginBottom="10px">
            ID: {/* {parcel.id.toString()} */}
          </h2>
           <p margin="8px 0">Name: {/* {parcel.itemName}*/}</p> 
          <p margin="8px 0">Description: {/*{parcel.itemDesc}*/}</p>
          <p margin="8px 0">Current Location:{/* {parcel.currentLocation}*/}</p>
          <p margin="8px 0">Status:{/* {getStatusString(parcel.status.toString())}*/}</p>
          <p margin="8px 0">
            Expected Delivery Date:{/* {new Date(parcel.expectedDelivery.toString() * 1000).toLocaleString()}*/}
          </p>
          <p margin="8px 0">OTP: {/*{parcel.otp.toString()}*/}</p>

          <Box display="flex" alignItems="center" marginTop="16px">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  color={star <= selectedRating ? "yellow" : "gray"}
                  size={24}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRatingChange(star)}
                />
              ))}
            </Box>

            <Button colorScheme="teal" marginTop="16px">
              Submit Rating
            </Button>

        </Box>
      {/* ) */}
      {/* ) */}
      {/* } */}
    </Box>
    </ChakraProvider>
  );
};

export default List;
