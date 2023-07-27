import React from 'react';
import { Box, Button, Flex, Heading, Image, Text, ChakraProvider } from '@chakra-ui/react';
import Typewriter from 'typewriter-effect';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { UserType } from "./utils";
import Navbar from './components/Navbar';

const Home = (myType) => {
  return (
    <>
      <ChakraProvider>
        <Box
          bgSize="cover"
          bgPosition="center"
          height="100vh"
          position="relative"
          backgroundColor="rgba(25, 255, 255, 0.7)"
        >
          <Flex
            height="100%"
            alignItems="center"
            justifyContent="space-around"
            px={8}
            py={16}
          >
            <Box maxW="md" color="black" mr={8}>
              <Heading as="h1" size="2xl" mb={6} fontFamily="Arial">
                <Typewriter
                  options={{
                    strings: ['SuperFluid Powered Decentralized Shipment Tracking & Delay Insurance Platform'],
                    autoStart: true,
                    loop: true,
                  }}
                />
              </Heading>
              <Text fontSize="1xl" mb={8} fontFamily="Arial">
                Our platform combines smart contracts, to revolutionize logistics and provides Effortless Shipment Tracking & Instant Insurance Claim Payouts.</Text>
              <Link to="/shipper">
                <Button
                  colorScheme="teal"
                  mr={4}
                  fontSize="md"
                  bgGradient="linear(to-r, teal.500, teal.400)"
                  _hover={{ bgGradient: 'linear(to-r, teal.600, teal.500)' }}
                >
                  Create
                </Button>
              </Link>

              {
              myType === UserType.PARTNER &&
              <Link to="/partner">
                <Button
                  colorScheme="teal"
                  variant="outline"
                  fontSize="md"
                  border="2px"
                  borderColor="teal.400"
                  _hover={{ bg: 'teal.100' }}
                >
                  Scan
                </Button>
              </Link>
              }

            </Box>

          </Flex>
        </Box>
      </ChakraProvider>
    </>
  );
};

export default Home;
