import React, { useState, useEffect } from 'react';
import { Box, Button, Input } from '@chakra-ui/react';

import { Link } from 'react-router-dom';
import { getMyId, getShipperById, ShipperType, UserType, registerAsShipper, unregisterAsShipper, addPartner, shipperDepositFund } from './utils';
const Shipper = ({ camoParcelInstance, userType }) => {

  const [id, setId] = useState('');
  const [shipper, setShipper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [canRegister, setCanRegister] = useState(false);
  const [partnerAddress, setPartnerAddress] = useState('');
  const [partnerSalary, setPartnerSalary] = useState('0');
  const [insuranceDeposit, setInsuranceDeposit] = useState('0');
  useEffect(() => {
    getShipperDetails();
  }, [camoParcelInstance, userType])


  const getShipperDetails = async () => {
    setLoading(true);
    let id = await getMyId(camoParcelInstance);
    setId(id);
    let shipperr = await getShipperById(camoParcelInstance, id);
    setShipper(shipperr);
    setCanRegister(canRegister)
    setLoading(false);
  }

  const unregister = async () => {
    unregisterAsShipper(camoParcelInstance);
  }

  const register = async () => {
    registerAsShipper(camoParcelInstance);
  }

  const addPartner_ = async () => {
    addPartner(camoParcelInstance, partnerAddress, partnerSalary);
  }

  const deposit = async () => {
    shipperDepositFund(camoParcelInstance, insuranceDeposit);
  }
  return (

    <Box display="flex" height="100vh" backgroundColor="rgba(25, 255, 255, 0.5)">
      <Box flex="1" display="flex" flexDirection="column" justifyContent="center" alignItems="center" padding="0">
        <Box display="flex" flexDirection="column" alignItems="center" gap="30px">
          {
            shipper &&
            <Box>
              <Box>Rating {shipper.rating.toString()}</Box>
              <Box>Rated By {shipper.totalRated.toString()}</Box>
              <Box>Deposit Amount {shipper.insuranceDeposit.toString()}</Box>
              <Box>Total Shipped Parcels {shipper.shippedParcels.length}
              </Box>
              <Box>Total Partners {shipper.myPartners.length}</Box>
              <Box>Status {shipper.status.toString()}</Box>
            </Box>
          }
          {
            ((userType !== UserType.SHIPPER || (shipper && (shipper.status.toString() === ShipperType.INACTIVE)))) &&
            <Button
              padding="20px 40px"
              borderRadius="10px"
              color="#fff"
              background="linear-gradient(90.69deg, #2472ff -22.6%, #7e51db 86.31%)"
              cursor="pointer"
              width="200px"
              height="40px"
              fontSize="15px"
              onClick={register}
            >
              Activate Shipper Subscription
            </Button>

          }
          {
            (!(userType !== UserType.SHIPPER || (shipper && (shipper.status.toString() === ShipperType.INACTIVE)))) &&
            <Button
              padding="20px 40px"
              borderRadius="10px"
              color="#fff"
              width="200px"
              height="40px"
              background="linear-gradient(90.69deg, #2472ff -22.6%, #7e51db 86.31%)"
              cursor="pointer"
              fontSize="15px"
              onClick={unregister}
            >
              Deacticate My Subscription
            </Button>
          }
        </Box>
      </Box>
      {
        shipper && shipper.status.toString() === ShipperType.ACTIVE &&
        <Box flex="1" display="flex" flexDirection="column" justifyContent="center" alignItems="center" padding="0">
          <Link to="/shipper/create">
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
              Create
            </Button>
          </Link>

          <Input
            type="text"
            id="partner_address"
            className="name-input"
            placeholder="Partner's Wallet Address"
            onChange={(event) => setPartnerAddress(event.target.value)}
          />
          <Input
            type="text"
            id="partner_salary"
            className="name-input"
            placeholder="Partner's Salary in Wei"
            onChange={(event) => setPartnerSalary(event.target.value)}
          />
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
            onClick={addPartner_}
          >
            Add Partner
          </Button>

          <Input
            type="text"
            id="insurance_deposit"
            className="name-input"
            placeholder="Deposit Amount in Wei"
            onChange={(event) => setInsuranceDeposit(event.target.value)}
          />
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
            onClick={deposit}
          >
            Deposit Insurance
          </Button>




          {/* <Button
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
        </Button> */}
        </Box>
      }
    </Box>
  );
};

export default Shipper;
