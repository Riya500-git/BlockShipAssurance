import React, { useRef, useState } from 'react';
import { Box, Button, Input, ChakraProvider } from '@chakra-ui/react';
import Html5QrcodePlugin from './Html5QrcodePlugin.jsx';

const Scan = ({ connectedAddress, myType, markParcelDelivered, updateLocation }) => {
  const [parcelId, setParcelId] = useState('');
  const [otpValue, setOtpValue] = useState('');

  const updateLoc = () => {
    if (navigator.geolocation) {
      let location_ = '';
      navigator.geolocation.getCurrentPosition((position) => {
        location_ = "" + position.coords.latitude + ',' + '' + position.coords.longitude;
        console.log("location_ =", location_);
      });
      updateLocation([parcelId], location_);
    } else {
      console.error('Geolocation is not supported by this browser');
    }
  }

  const markDelivered = () => {
    markParcelDelivered(parcelId, otpValue);
  }

  const onNewScanResult = (decodedText, decodedResult) => {
    console.log("App [result]", decodedResult);
    const info = decodedText.split(' ');
    const element = document.getElementById('parcelId');
    element.textContent = info[2];
    setParcelId(info[2]);
    // setDecodedResults(prev => [...prev, decodedResult]);
  };

  return (
    <ChakraProvider>
    <Box className="parcel-containers" backgroundColor="rgba(25, 255, 255, 0.5)" display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh" marginTop="0">
      <Html5QrcodePlugin fps={10} qrbox={250} disableFlip={false} qrCodeSuccessCallback={onNewScanResult} />

      <Box className="parcel-id-box" marginTop="20px" padding="0px" backgroundColor="#ffffff" border="0px solid #dddddd" borderRadius="8px" marginBottom="50px" width="400px" >
        <Input
          type="text"
          id="parcelId"
          value={parcelId}
          className="name-input"
          placeholder="ParcelId"
          onChange={(event) => setParcelId(event.target.value)}
        />
      </Box>

      <Box className="action-buttons">
        <Button onClick={updateLoc} marginRight="10px" padding="8px 16px" ml={10} backgroundColor="#2472ff" color="#ffffff" borderRadius="4px" fontSize="16px" cursor="pointer" width="150px" height="40px" background="linear-gradient(90.69deg, #2472ff -22.6%, #7e51db 86.31%)">
          Update Location
        </Button>
        <Button onClick={markDelivered} padding="8px 16px" ml={5} backgroundColor="#2472ff" color="#ffffff" borderRadius="4px" fontSize="16px" cursor="pointer" width="150px" height="40px" background="linear-gradient(90.69deg, #2472ff -22.6%, #7e51db 86.31%)">
          Mark Delivered
        </Button>
        <Box className="parcel-id-box" mt={10} backgroundColor="#ffffff" borderRadius="8px" width="400px" >
          <Input
            type="text"
            id="otp_value"
            className="name-input"
            placeholder="OTP"
            onChange={(event) => setOtpValue(event.target.value)}
          />
        </Box>
      </Box>
    </Box>
    </ChakraProvider>
  );
};

export default Scan;
