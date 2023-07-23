import './App.css';
import React, { useState, useEffect } from 'react';
import Scan from './Scan';
import Owner from './Owner';
import List from './List';
import Create from './Create';
import Navbar from './components/Navbar';
import Home from './Home';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


import Web3 from 'web3';
import { ethers } from "ethers";

import { Framework } from "@superfluid-finance/sdk-core";

import { addrParcel, CHAIN_PARAMS, UserType } from './utils';


function App() {

  // web3 essentials
  const [walletAddress, setWalletAddress] = useState('_');
  const [web3, setWeb3] = useState(null);
  const [camoParcelInstance, setCamoParcelInstance] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    connectWallet();
  }, []);

  useEffect(() => {
    if (!web3) {
      console.error("web3 is NULL")
      return;
    }
    listenMMAccount();
    loadContracts();
  }, [web3]);

  useEffect(() => {
    if (!camoParcelInstance) {
      console.error("camoParcelInstance is NULL")
      return;
    }

    getMyType();
  })

  const connectWallet = async () => {
    console.log("connectWallet() called")

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [CHAIN_PARAMS],
      });

      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();

        // Get the selected account
        const accounts = await web3.eth.getAccounts();
        const address = accounts[0];
        setWalletAddress(address);
        setWeb3(web3);
      } else {
        console.error('Metamask extension not detected');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to connect Metamask. Please try again.');
    }
  };

  const listenMMAccount = async () => {
    try {
      window.ethereum.on("accountsChanged", async function () {
        window.location.reload();
      });
    } catch (error) {
      console.error(error)
    }
  }

  const loadContracts = async () => {
    console.log("loadContracts() called")
    if (!web3) throw new Error("Web3 is null")
    console.log("web3:- ", web3);
    try {
      const web3Instance = web3; // Access the web3 state variable
      const { abi } = require('./contract_abis/CamoSuperParcel.json');
      const camoParcelAbi = abi;
      const camoParcelInstance = new web3Instance.eth.Contract(camoParcelAbi, addrParcel);
      console.info("camoParcelInstance:- ", camoParcelInstance);
      setCamoParcelInstance(camoParcelInstance)
    } catch (error) {
      console.error(error);
    }
  }


  async function updateFlowPermissions(
    operator,
    flowRateAllowance,
    permissionType
  ) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    const signer = provider.getSigner();

    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    const sf = await Framework.create({
      chainId: Number(chainId),
      provider: provider
    });

    const superSigner = sf.createSigner({ signer: signer });

    console.log(signer);
    console.log(await superSigner.getAddress());
    const daix = await sf.loadSuperToken("MATICx");

    console.log(daix);

    try {
      const updateFlowOperatorOperation = daix.updateFlowOperatorPermissions({
        flowOperator: operator,
        permissions: permissionType,
        flowRateAllowance: flowRateAllowance
        // userData?: string
      });

      console.log("Updating your flow permissions...");

      const result = await updateFlowOperatorOperation.exec(signer);
      console.log(result);

      console.log(
        `
    Super Token: DAIx
    Operator: ${operator}
    Permission Type: ${permissionType},
    Flow Rate Allowance: ${flowRateAllowance}
    `
      );
    } catch (error) {
      console.log(
        "Hmmm, your transaction threw an error. Make sure that this stream does not already exist, and that you've entered a valid Ethereum address!"
      );
      console.error(error);
    }
  }



  // User functions
  const [userType, setUserType] = useState();

  const getMyType = async () => {
    try {
      let result = await camoParcelInstance.methods.getMyType().call({ from: window.web3.currentProvider.selectedAddress });
      result = result.toString();
      let type = UserType.NONE;
      if (result === "1") {
        type = UserType.SHIPPER;
      } else if (result === "2") {
        type = UserType.PARTNER;
      } else if (result === "9") {
        type = UserType.OWNER;
      }
      setUserType(type);
      console.info("userType: ", type.toString());
    } catch (error) {
      console.error(error);
    }
  };

  const rateDeliveredParcel = async (pId, stars) => {
    try {
      let result = await camoParcelInstance.methods.rateDeliveredParcel(pId, stars).send({ from: window.web3.currentProvider.selectedAddress });
      console.info("result: ", result);
    } catch (error) {
      console.error(error);
    }
  }

  const viewMYParcels = async () => {
    try {
      let result = await camoParcelInstance.methods.viewMYParcels().call({ from: window.web3.currentProvider.selectedAddress });
      console.info("result: ", result);
    } catch (error) {
      console.error(error);
    }
  }

  const getMyId = async () => {
    try {
      let result = await camoParcelInstance.methods.getMyId().call({ from: window.web3.currentProvider.selectedAddress });
      console.info("result: ", result);
    } catch (error) {
      console.error(error);
    }
  }

  const getShipperById = async (pId) => {
    try {
      let result = await camoParcelInstance.methods.getShipperById(pId).call({ from: window.web3.currentProvider.selectedAddress });
      console.info("result: ", result);
    } catch (error) {
      console.error(error);
    }
  }

  // Shipper Functions
  const registerAsShipper = async () => {
    try {
      await updateFlowPermissions(addrParcel, "1000000000000000", "7");
      let result = await camoParcelInstance.methods.registerAsShipper().send({ from: window.web3.currentProvider.selectedAddress });
      console.info("result: ", result);
    } catch (error) {
      console.error(error);
    }
  }

  const unregisterAsShipper = async () => {
    try {
      let result = await camoParcelInstance.methods.unregisterAsShipper().send({ from: window.web3.currentProvider.selectedAddress });
      console.info("result: ", result);
    } catch (error) {
      console.error(error);
    }
  }

  const addPartner = async (partner_address, salary) => {
    try {
      let result = await camoParcelInstance.methods.addPartner(partner_address, salary).send({ from: window.web3.currentProvider.selectedAddress });
      console.info("result: ", result);
    } catch (error) {
      console.error(error);
    }
  }

  const removePartner = async (partner_Id) => {
    try {
      let result = await camoParcelInstance.methods.removePartner(partner_Id).send({ from: window.web3.currentProvider.selectedAddress });
      console.info("result: ", result);
    } catch (error) {
      console.error(error);
    }
  }

  const shipOrer = async (itemName, itemDesc, userAddress, expectedDelivery, baseCompensation, otp) => {
    try {
      let result = await camoParcelInstance.methods.shipOrder(itemName, itemDesc, userAddress, expectedDelivery, baseCompensation, otp).send({ from: window.web3.currentProvider.selectedAddress });
      console.info("result: ", result);
    } catch (error) {
      console.error(error);
    }
  }

  const viewParcel = async (pId) => {
    try {
      let result = await camoParcelInstance.methods.viewParcel(pId).call({ from: window.web3.currentProvider.selectedAddress });
      console.info("result: ", result);
    } catch (error) {
      console.error(error);
    }
  }

  const viewMyShippedParcels = async () => {
    try {
      let result = await camoParcelInstance.methods.viewMyShippedParcels().call({ from: window.web3.currentProvider.selectedAddress });
      console.info("result: ", result);
    } catch (error) {
      console.error(error);
    }
  }

  const viewMyPartners = async () => {
    try {
      let result = await camoParcelInstance.methods.viewMyPartners().call({ from: window.web3.currentProvider.selectedAddress });
      console.info("result: ", result);
    } catch (error) {
      console.error(error);
    }
  }

  const shipperDepositFund = async (amount) => {
    try {
      let result = await camoParcelInstance.methods.shipperDepositFund(amount).send({ from: window.web3.currentProvider.selectedAddress });
      console.info("result: ", result);
    } catch (error) {
      console.error(error);
    }
  }

  // Partner functions
  const updateLocation = async (pId, location) => {
    try {
      let result = await camoParcelInstance.methods.updateLocation(pId, location).send({ from: window.web3.currentProvider.selectedAddress });
      console.info("result: ", result);
    } catch (error) {
      console.error(error);
    }
  }

  const markParcelDelivered = async (pId, otp) => {
    try {
      let result = await camoParcelInstance.methods.markParcelDelivered(pId, otp).send({ from: window.web3.currentProvider.selectedAddress });
      console.info("result: ", result);
    } catch (error) {
      console.error(error);
    }
  }

  // Owner functions
  const banShipper = async (id) => {
    try {
      let result = await camoParcelInstance.methods.banShipper(id).send({ from: window.web3.currentProvider.selectedAddress });
      console.info("result: ", result);
    } catch (error) {
      console.error(error);
    }
  }

  const withdrawFundsCollected = async (amount) => {
    try {
      let result = await camoParcelInstance.methods.withdrawFundsCollected(amount).send({ from: window.web3.currentProvider.selectedAddress });
      console.info("result: ", result);
    } catch (error) {
      console.error(error);
    }
  }




  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/shipper" element={<Create myType={userType} registerAsShipper={registerAsShipper} unregisterAsShipper={unregisterAsShipper} />} />

        <Route path="/partner" element={<Scan />} />

        <Route path="/myparcels" element={<List />} />

        <Route path="/owner" element={<Owner />} />
      </Routes>
    </Router>
  );
}

export default App;
