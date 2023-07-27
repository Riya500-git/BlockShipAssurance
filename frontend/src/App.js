import './App.css';
import React, { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import Scan from './Scan';
import Owner from './Owner';
import List from './List';
import Create from './Create';
import Navbar from './components/Navbar';
import Home from './Home';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Shipper from './Shipper';
import PartnersList from './PartnersList';

import Web3 from 'web3';
import { addrParcel, CHAIN_PARAMS, generateQRCode, UserType } from './utils';

const eventTopicPS = "0x32c1836ded10d94133bd527768a93f4a18336e79a66c70baa8093401c9e3440f";
const eventTopicLU = "0xa3c313d9290f28b0a583dcc5ceabc0a50c3124d1ae9ae1630668c1f404d5a6b6";
const eventTopicPD = "0x3be6b44b0d8170026cc992b6b6eda259b98e02d16bdfe4b9dd3db223b5420cfd";

const contract_url = CHAIN_PARAMS.blockExplorerUrls[0] + "address/" + addrParcel;

function App() {
  console.log(contract_url)

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
        sendToHome();
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
      attachEventListeners();
    } catch (error) {
      console.error(error);
    }
  }
  // const navigate = useNavigate();
  const sendToHome = () => {
    // navigate('/home');
  }

  const toast = useToast();

  let processedEventIds = [];

  let shouldProcessEvent = (eventId) => {
    console.log("shouldProcessEvent(_) called", eventId);

    if (processedEventIds.includes(eventId)) {
      return false;
    }
    processedEventIds.push(eventId);
    if (processedEventIds.length === 1000) {
      processedEventIds = [];
    }
    return true;
  }


  function processEvent(eventData, topics) {
    const eventAbi = {
      "inputs": [
        {
          "indexed": false,
          "name": "arg1",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "arg2",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "arg3",
          "type": "uint256"
        }
      ],
    };
    const eventTopic = topics[0];

    // Decode the data
    const decodedData = (new Web3()).eth.abi.decodeLog(eventAbi.inputs, eventData, eventTopic);

    // Access the decoded data
    const event_updater = decodedData.arg1;
    const receiver = decodedData.arg2;
    const parcelId = decodedData.arg3;
    console.log("event_updater:- ", event_updater);
    console.log("receiver:- ", receiver);
    console.log("parcelId:- ", parcelId);

    if (eventTopic === eventTopicLU) {
      parcelLocationUpdatedEvent(walletAddress, event_updater, receiver, parcelId);
    } else if (eventTopic === eventTopicPD) {
      ParcelDeliveredEvent(walletAddress, event_updater, receiver, parcelId);
    } else if (eventTopic === eventTopicPS) {
      parcelShippedEvent(walletAddress, event_updater, receiver, parcelId);
    }
  }

  let attachEventListeners = () => {
    console.log("attachEventListener() called");

    const contract = camoParcelInstance;
    if (!contract) return;
    console.log("attached")
    console.log(contract.events)

    // ({}, (error, event) => {
    //   console.log("------------", error, event)
    //   if (error) {
    //     console.error('Error listening to PlayerEntered event:', error);
    //     return;
    //   }

    //   if (!shouldProcessEvent(event.id)) return;
    //   console.log(event);
    // })
  }


  const parcelShippedEvent = async (walletAddress, sender, receiver, parcelId) => {
    console.log(`Parcel ${parcelId} shipped from ${sender} to ${receiver}`);
    if (sender === walletAddress) {
      const text = sender + " " + receiver + " " + parcelId;
      const qr_url = await generateQRCode(text);
      console.log("qr_url:- ", qr_url);

      alert(`Your parcel with ID ${parcelId} has been shipped to ${receiver}. Click OK to view the QR Code.`);
      // window.open(qr_url, '_blank');
      const qrPageUrl = window.open("", "_blank");
      qrPageUrl.document.write(`
        <html>
          <body>
            <img src="${qr_url}" alt="QR Code">
          </body>
        </html>
      `);
      qrPageUrl.document.close();
    }

    else if (receiver.toLowerCase() === walletAddress.toLowerCase()) {
      // TODO show the receiver parcel has shipped and its id
      toast({
        title: 'Parcel Shipped',
        description: `You have received a parcel with ID ${parcelId} from ${sender}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const parcelLocationUpdatedEvent = (walletAddress, partner, receiver, parcelId) => {

    console.log(`Parcel ${parcelId} updated by ${partner}, `, walletAddress);
    if (partner === walletAddress) toast({
      title: 'Parcel Location Updated',
      description: `Location for parcel with ID ${parcelId} has been updated by successfully`,
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
    else if (receiver === walletAddress) toast({
      title: 'Parcel Location Updated',
      description: `Location for your parcel with ID ${parcelId} has been updated by ${partner}`,
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
  };

  const ParcelDeliveredEvent = (walletAddress, partner, receiver, parcelId) => {
    if (partner === walletAddress || receiver === walletAddress) toast({
      title: 'Parcel Delivered',
      description: `Parcel with ID ${parcelId} has been delivered by ${partner}`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

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


  // Shipper Functions
  const shipOrder = async (itemName, itemDesc, userAddress, expectedDelivery, baseCompensation, otp) => {
    try {
      let result = await camoParcelInstance.methods.shipOrder(itemName, itemDesc, userAddress, expectedDelivery, baseCompensation, otp).send({ from: window.web3.currentProvider.selectedAddress });
      console.info("result: ", result);
      for (var log in result.logs) {
        console.log(result.logs[log].data);
        processEvent(result.logs[log].data, result.logs[log].topics);
      }
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
      console.log("pId: ", pId, "location: ", location);
      let result = await camoParcelInstance.methods.updateLocation(Number(pId), location).send({ from: window.web3.currentProvider.selectedAddress });
      console.info("result: ", result);
      for (var log in result.logs) {
        console.log(result.logs[log].data);
        processEvent(result.logs[log].data, result.logs[log].topics);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const markParcelDelivered = async (pId, otp) => {
    try {
      let result = await camoParcelInstance.methods.markParcelDelivered(pId, otp).send({ from: window.web3.currentProvider.selectedAddress });
      console.info("result: ", result);
      for (var log in result.logs) {
        console.log(result.logs[log].data);
        processEvent(result.logs[log].data, result.logs[log].topics);
      }
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
      <Navbar myType={userType} connectedAddress={walletAddress} />
      <Routes>
        <Route path="/" element={<Home myType={userType} />} />

        <Route path="/shipper" element={<Shipper camoParcelInstance={camoParcelInstance} userType={userType} />} />

        <Route path="/shipper/create" element={<Create myType={userType} shipOrder={shipOrder} />} />

        <Route path="/shipper/partners" element={<PartnersList camoParcelInstance={camoParcelInstance} />} />

        <Route path="/partner" element={<Scan myType={userType} markParcelDelivered={markParcelDelivered} updateLocation={updateLocation} />} />

        <Route path="/myparcels" element={<List camoParcelInstance={camoParcelInstance} myType={userType} />} />

        <Route path="/owner" element={<Owner walletAddress={walletAddress} myType={userType} banShipper={banShipper} withdrawFunds={withdrawFundsCollected} />} />
      </Routes>
    </Router>
  );
}

export default App;
