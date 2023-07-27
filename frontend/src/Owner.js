import React, { useState } from "react";
import { Box, Button, Input } from '@chakra-ui/react';

const Owner = ({ walletAddress, myType, banShipper, withdrawFunds }) => {
  const [id, setShipperId] = useState("");

  const ban = () => {
    banShipper(Number(id));
  }

  return (
    <Box display="flex" height="100vh" backgroundColor="rgba(25, 255, 255, 0.5)"
    >
      <Box flex="1" display="flex" flexDirection="column" justifyContent="center" alignItems="center" padding="0">
        <Input
          type="text"
          width="350px"
          height="40px"
          padding="5px"
          border="1px solid #ccc"
          borderRadius="10px"
          marginBottom="50px"
          placeholder="Enter Shipper Id to ban"
          onChange={(event) => setShipperId(event.target.value)}
        />
        <Box display="flex" flexDirection="column" alignItems="center" gap="30px">
          <Button
            padding="20px 40px"
            borderRadius="10px"
            color="#fff"
            background="linear-gradient(90.69deg, #2472ff -22.6%, #7e51db 86.31%)"
            cursor="pointer"
            width="150px"
            height="40px"
            fontSize="15px"
            onClick={ban}
          >
            Ban Shipper
          </Button>
        </Box>
      </Box>
      <Box flex="1" display="flex" flexDirection="column" justifyContent="center" alignItems="center" padding="0">
        <Button
          padding="50px 100px"
          borderRadius="10px"
          color="#fff"
          width="150px"
          height="40px"
          background="linear-gradient(90.69deg, #2472ff -22.6%, #7e51db 86.31%)"
          fontSize="20px"
          fontWeight="bold"
          cursor="pointer"
          onClick={withdrawFunds}
        >
          Withdraw Funds
        </Button>
      </Box>
    </Box>
  );
};

export default Owner;
