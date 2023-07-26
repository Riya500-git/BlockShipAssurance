import React, { useState, useEffect } from 'react';
import { Box, ChakraProvider, Button, Stack, VStack, CloseButton } from '@chakra-ui/react';
import { FaStar } from 'react-icons/fa';
import { removePartner, viewMyPartners } from './utils';


const PartnersList = ({ camoParcelInstance }) => {
	const [partners, setMyPartners] = useState();

	useEffect(() => {
		getPartners()
	}, [camoParcelInstance])
	const getPartners = async () => {
		let partners = await viewMyPartners(camoParcelInstance);
		setMyPartners(partners);
	}

	const removePartner_ = async (address) => {
		await removePartner(camoParcelInstance, address);
	}
	return (
		<ChakraProvider>
			{partners && <Box
				display="grid"
				gridTemplateColumns="repeat(auto-fit, minmax(350px, 1fr))"
				gap="50px"
				padding="150px"
				backdropFilter="blur(10px)"
				backgroundColor="rgba(25, 255, 255, 0.5)"
				height="100vh"
				marginTop="0"
			>
				{
					partners.map((partner) => (
						<Box p={4}>
							<Box bg="white" p={4} shadow="md" borderRadius="md" borderWidth="1px">
								<VStack spacing={4} alignItems="flex-start">
									<Stack direction="row" alignItems="center">
										<Box fontSize="15px">Address: {partner.walletAddress}</Box>
									</Stack>
									<Stack direction="row" alignItems="center">
										<Box fontSize="15px">Salary: {partner.salary.toString()}</Box>
									</Stack>
									<Box
										size="sm"
										borderRadius="full"
										bg={partner.active ? 'green.500' : 'red.500'}
									>
										{partner.active ? 'Active' : 'Inactive'}
									</Box>
									<CloseButton onClick={() => removePartner_(partner.walletAddress)} size="sm" alignSelf="flex-end" />
								</VStack>
							</Box>
						</Box>
					))}
			</Box>
			}
		</ChakraProvider>
	);
};

export default PartnersList;
