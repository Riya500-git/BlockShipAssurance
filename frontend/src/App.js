import './App.css';
import React, { useState, useEffect } from 'react';
import Scan from './Scan';
import Owner from './Owner';
import List from './List';
import Create from './Create';
import Navbar from './components/Navbar';
import Home from './Home';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Shipper from './Shipper';
import PartnersList from './PartnersList';

import Web3 from 'web3';

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
      await attachListeners();
    } catch (error) {
      console.error(error);
    }
  }

  const attachListeners = async () => {
    console.log("attachListeners() called")
    if (!camoParcelInstance) return;
    camoParcelInstance.events.ParcelShippedEvent({}, (error, event) => {
      if (error) {
        console.error(error);
        return;
      }
      if (!shouldProcessEvent(event.id)) return;
      console.log(event);

      const sender = event.returnValues[0];
      const receiver = event.returnValues[1];
      const parcelId = event.returnValues[2].toString();
      console.log(sender, receiver, parcelId);
      // TODO make toast for sender and receiver
    })

    camoParcelInstance.events.ParcelLocationUpdated({}, (error, event) => {
      if (error) {
        console.error(error);
        return;
      }
      if (!shouldProcessEvent(event.id)) return;
      console.log(event);

      const partner = event.returnValues[0];
      const receiver = event.returnValues[1];
      const parcelId = event.returnValues[2].toString();

      console.log(partner, receiver, parcelId);
      // TODO make toast for partner and receiver
    })

    camoParcelInstance.events.ParcelDelivered({}, (error, event) => {
      if (error) {
        console.error(error);
        return;
      }
      if (!shouldProcessEvent(event.id)) return;
      console.log(event);
      const partner = event.returnValues[0];
      const receiver = event.returnValues[1];
      const parcelId = event.returnValues[2].toString();
      console.log(partner, receiver, parcelId);
      // TODO make toast for partner and receiver
    })
  }
  const processedEvents = new Set();
  const shouldProcessEvent = (evenId) => {
    if (processedEvents.has(evenId)) return false;
    if (processedEvents.size >= 10000) processedEvents.clear()
    processedEvents.add(evenId);
    return true;
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

  // Shipper Functions
  const shipOrder = async (itemName, itemDesc, userAddress, expectedDelivery, baseCompensation, otp) => {
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
    // <Shipper/>

    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/shipper" element={<Shipper camoParcelInstance={camoParcelInstance} userType={userType} />} />

        <Route path="/shipper/create" element={<Create myType={userType} shipOrder={shipOrder} />} />


        <Route path="/shipper/partners" element={<PartnersList camoParcelInstance={camoParcelInstance} />} />

        <Route path="/partner" element={<Scan myType={userType} markParcelDelivered={markParcelDelivered} updateLocation={updateLocation} />} />

        <Route path="/myparcels" element={<List connectedAddress={walletAddress} myType={userType} myParcels={viewMYParcels} />} />

        <Route path="/owner" element={<Owner walletAddress={walletAddress} myType={userType} banShipper={banShipper} withdrawFunds={withdrawFundsCollected} />} />
      </Routes>
    </Router>
  );
}

export default App;
