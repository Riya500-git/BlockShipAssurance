import React, { useState } from "react";
import { Box, Button} from '@chakra-ui/react';

const Shipper = () => {

  return (
    <Box display="flex" height="100vh" backgroundColor="rgba(25, 255, 255, 0.5)">
      <Box flex="1" display="flex" flexDirection="column" justifyContent="center" alignItems="center" padding="0">
        <Box display="flex" flexDirection="column" alignItems="center" gap="30px">
          <Button
            padding="20px 40px"
            borderRadius="10px"
            color="#fff"
            background="linear-gradient(90.69deg, #2472ff -22.6%, #7e51db 86.31%)"
            cursor="pointer"
            width="200px"
            height="40px"
            fontSize="15px"
          >
            Register as Shipper
          </Button>
        
          <Button
            padding="20px 40px"
            borderRadius="10px"
            color="#fff"
            width="200px"
            height="40px"
            background="linear-gradient(90.69deg, #2472ff -22.6%, #7e51db 86.31%)"
            cursor="pointer"
            fontSize="15px"
          >
            Unregister as Shipper
          </Button>
        </Box>
      </Box>
      <Box flex="1" display="flex" flexDirection="column" justifyContent="center" alignItems="center" padding="0">
        <Button
          padding="50px 100px"
          borderRadius="10px"
          color="#fff"
          background="linear-gradient(90.69deg, #2472ff -22.6%, #7e51db 86.31%)"
          fontSize="20px"
          width="150px"
          height="40px"
          cursor="pointer"
          marginBottom="20px"
        >
          App Partner
        </Button>
        <Button
          padding="50px 100px"
          borderRadius="10px"
          color="#fff"
          width="150px"
          height="40px"
          background="linear-gradient(90.69deg, #2472ff -22.6%, #7e51db 86.31%)"
          fontSize="20px"
          cursor="pointer"
        >
          Remove Partner
        </Button>
      </Box>
    </Box>
  );
};

export default Shipper;
