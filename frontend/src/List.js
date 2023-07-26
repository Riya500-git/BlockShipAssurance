import React, { useEffect, useState } from 'react';
import { Box, ChakraProvider, Button } from '@chakra-ui/react';
import { FaStar } from 'react-icons/fa';
import { ParcelStatus, UserType, rateDeliveredParcel, viewMyParcels } from './utils';


const List = ({ camoParcelInstance, myType }) => {

  const [parcels, setMyParcels] = useState([]);

  useEffect(() => {
    getParcels();
  }, [camoParcelInstance])

  const getParcels = async () => {
    let parcels = await viewMyParcels(camoParcelInstance);
    // check if parcels is array
    if (Array.isArray(parcels))
      setMyParcels(parcels);
  }

  const getStatusString = (status_) => {
    if (status_ === ParcelStatus.Dispatched) return "Dispatched";
    else if (status_ === ParcelStatus.InTransit) return "In Transit";
    else if (status_ === ParcelStatus.Delivered) return "Delivered";
    return "Failed";
  };

  const [selectedRating, setSelectedRating] = useState(0);

  const handleRatingChange = (rating) => {
    if (myType === UserType.SHIPPER) return;
    setSelectedRating(rating);
  };

  const submitRating = async (pId) => {
    await rateDeliveredParcel(camoParcelInstance, selectedRating, pId);
  }
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
        {parcels.map((parcel) => (
          <Box
            key={parcel.id.toString()}
            width="100%"
            height="auto"
            padding="20px"
            backgroundColor="#ffffff"
            border="0px solid #dddddd"
            borderRadius="8px"
            flexDirection="column"
          >
            <h2 fontSize="20px" marginBottom="10px">
              ID: {parcel.id.toString()}
            </h2>
            <p margin="8px 0">Name: {parcel.itemName}</p>
            <p margin="8px 0">Description: {parcel.itemDesc}</p>
            <p margin="8px 0">Current Location: {parcel.currentLocation}</p>
            <p margin="8px 0">Status: {getStatusString(parcel.status.toString())}</p>
            {
              myType === UserType.SHIPPER &&
              <p margin="8px 0">Receiver: {parcel.receiver}</p>
            }
            {
              myType !== UserType.SHIPPER &&
              <p margin="8px 0">Sender: {parcel.sender}</p>

            }
            <p margin="8px 0">
              Expected Delivery Date:{new Date(parcel.expectedDelivery.toString() * 1000).toLocaleString()}
            </p>
            <p margin="8px 0">OTP: {parcel.otp.toString()}</p>

            {
              parcel.status === ParcelStatus.Delivered &&
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
            }

            {myType !== UserType.SHIPPER && parcel.status.toString() === ParcelStatus.Delivered &&
              <Button colorScheme="teal" marginTop="16px" onClick={() => submitRating(parcel.id.toString())}>
                Submit Rating
              </Button>
            }
          </Box>
        )
        )
        }
      </Box>
    </ChakraProvider>
  );
};

export default List;
