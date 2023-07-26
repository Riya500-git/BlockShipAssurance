// SPDX-License-Identifier: GPL-3.0-only
// Author:- @sauravrao637
pragma solidity ^0.8.14;

// initializing the CFA Library

import {
    ISuperfluid, 
    ISuperToken, 
    ISuperApp
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import { SuperTokenV1Library } from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";

import "hardhat/console.sol";

error Unauthorized();

contract CamoSuperParcel{
    /// @notice Owner.
    address public owner;

    /// @notice CFA Library.
    using SuperTokenV1Library for ISuperToken;
    ISuperToken token;

    uint8 constant SHIPPER_ACTIVE = 1;
    uint8 constant SHIPPER_INACTIVE = 2;
    uint8 constant SHIPPER_BANNED = 3;
    uint8 constant P_STATUS_DISPATCHED = 1;
    uint8 constant P_STATUS_IN_TRANSIT = 2;
    uint8 constant P_STATUS_DELIVERED = 3;


    uint parcelId = 1;
    uint shipperId = 1;
    uint partnerId = 1;

    struct Parcel{
        uint id;
        address receiver;
        address sender;
        string itemName;
        string itemDesc;
        uint expectedDelivery;
        uint status;
        string currentLocation;
        uint baseCompensation;
        uint otp;
        uint rating;
    }

    struct Partner {
        address walletAddress;
        address associatedShipper;
        int96 salary;
        bool active;
    }

    struct Shipper {
        address walletAddress;
        uint[] myPartners;
        uint[] shippedParcels;
        uint insuranceDeposit;
        uint8 status;
        uint rating;
        uint totalRated;
    }

    mapping(address => uint) shipperIdByAddress;
    mapping(address => uint) partnerIdByAddress;
    mapping(uint => Shipper) shipperById;
    mapping(uint => Partner) partnerById;
    
    mapping(address => uint[]) userParcels;
    mapping(uint => Parcel) parcels;

    int96 shipperFee;
    
    modifier onlyOwner() {
        if(msg.sender != owner) {revert Unauthorized();}
        _;
    }

    modifier onlyActiveShipper(){
        if(shipperById[shipperIdByAddress[msg.sender]].status != SHIPPER_ACTIVE) {revert Unauthorized();}
        _;
    }

    modifier onlyActivePartner(){
        if(!partnerById[partnerIdByAddress[msg.sender]].active) {revert Unauthorized();}
        _;
    }
    // 0x96B82B65ACF7072eFEb00502F45757F254c2a0D4
    constructor(address token_addr, int96 shipperFee_){
        token = ISuperToken(token_addr);
        owner = msg.sender;
        shipperFee = shipperFee_;
    }
 
    event ParcelShippedEvent(address, address, uint);
    event ParcelLocationUpdated(address, address, uint);
    event ParcelDelivered(address, address, uint);

    function registerAsShipper() external{
        require(partnerIdByAddress[msg.sender]==0 , "4");
        uint sender_status = shipperById[shipperIdByAddress[msg.sender]].status;
        require( sender_status != SHIPPER_ACTIVE && sender_status != SHIPPER_BANNED, "5");
        token.createFlowFrom(msg.sender, address(this), shipperFee);
        uint[] memory emptyArray;
        Shipper memory shipper = Shipper(
            msg.sender,
            emptyArray,
            emptyArray,
            0,
            SHIPPER_ACTIVE,
            0,
            0
        );
        shipperIdByAddress[msg.sender] = shipperId;
        shipperById[shipperId] = shipper;
        shipperId++;
    }

    function unregisterAsShipper() external onlyActiveShipper{
        token.deleteFlow(msg.sender, address(this));
        shipperById[shipperIdByAddress[msg.sender]].status = SHIPPER_INACTIVE;
    }

    function banShipper(uint id) external onlyOwner{
        shipperById[id].status = SHIPPER_BANNED;
    }

    // active shipper can hire partners
    function addPartner(address partner, int96 salary) external onlyActiveShipper{
        require(shipperIdByAddress[partner] ==0, "6");
        require(partnerIdByAddress[partner] ==0, "7");
        token.createFlowFrom(msg.sender, partner, salary);
        Partner memory partnerr = Partner(
            partner,
            msg.sender,
            salary,
            true
        );
        partnerIdByAddress[partner] = partnerId;
        partnerById[partnerId] = partnerr;
        shipperById[shipperIdByAddress[msg.sender]].myPartners.push(partnerId);
        partnerId = partnerId +1;
    }

    function removePartner(address partner_addr) external onlyActiveShipper{
        uint partner_Id = partnerIdByAddress[partner_addr];
        require(partnerId !=0, "26");
        require(partnerById[partner_Id].associatedShipper == msg.sender, "8" );
        require(partnerById[partner_Id].active, "9");
        token.deleteFlow(msg.sender, partnerById[partner_Id].walletAddress);
        partnerById[partner_Id].active = false;
    }

    function shipOrder(string memory itemName, string memory itemDesc, address userAddress, uint expectedDelivery, uint baseCompensation, uint otp) external onlyActiveShipper{
        require(expectedDelivery > block.timestamp, "Invalid expectedDelivery");
        require(shipperById[shipperIdByAddress[msg.sender]].insuranceDeposit >= baseCompensation, "20");
        Parcel memory parcel = Parcel(
            parcelId,
            userAddress,
            msg.sender,
            itemName,
            itemDesc,
            expectedDelivery,
            P_STATUS_DISPATCHED,
            "",
            baseCompensation,
            otp,
            0
        );
        
        userParcels[userAddress].push(parcelId);
        parcels[parcelId] = parcel;
        shipperById[shipperIdByAddress[msg.sender]].shippedParcels.push(parcelId);
        emit ParcelShippedEvent(msg.sender, userAddress, parcelId);

        parcelId++;
    }

    function updateLocation(uint pId, string memory location) external onlyActivePartner{  
        require(parcels[pId].status == P_STATUS_DISPATCHED || parcels[pId].status == P_STATUS_IN_TRANSIT, "10");
        parcels[pId].currentLocation = location;
        parcels[pId].status = P_STATUS_IN_TRANSIT;
        emit ParcelLocationUpdated(msg.sender, parcels[pId].receiver, pId);
    }

    function calcCompensation(uint expectedDelivery, uint baseCompensation) private view returns(uint){
        if(expectedDelivery >= block.timestamp) return 0;
        uint difDays = (block.timestamp - expectedDelivery)/(1 days);
        return difDays*baseCompensation;
    }

    function markParcelDelivered(uint pId, uint otp) external onlyActivePartner {
        require(otp == parcels[pId].otp, "11");
        require(parcels[pId].status == P_STATUS_DISPATCHED || parcels[pId].status == P_STATUS_IN_TRANSIT,"12");
        parcels[pId].currentLocation = "";
		parcels[pId].status = P_STATUS_DELIVERED;
		uint compensation = calcCompensation(parcels[pId].expectedDelivery, parcels[pId].baseCompensation);
        require(shipperById[shipperIdByAddress[parcels[pId].sender]].insuranceDeposit >= compensation);
		if(compensation !=0){
			bool sent = payable(parcels[pId].receiver).send(compensation);
			require(sent, "14");
            shipperById[shipperIdByAddress[parcels[pId].sender]].insuranceDeposit-=compensation;
		}
		emit ParcelDelivered(msg.sender, parcels[pId].receiver, pId);
    }

    function rateDeliveredParcel(uint pId, uint stars) external{
        Parcel memory parcel = parcels[pId];
        require(parcel.receiver == msg.sender, "15");
        require(parcel.rating == 0, "16");
        require(parcel.status == P_STATUS_DELIVERED, "17");
        require(stars<=5 && stars>0, "18");
        parcels[pId].rating = stars;
        Shipper storage shipper = shipperById[shipperIdByAddress[parcel.sender]];
        uint newRating = shipper.rating + (stars*10**18)/(shipper.totalRated+1);
        // shipperById[shipperIdByAddress[parcel.sender]].totalRated = shipper.totalRated+1;
        // shipperById[shipperIdByAddress[parcel.sender]].rating = newRating;
        
        shipper.totalRated = shipper.totalRated+1;
        shipper.rating = newRating;
    }

    function viewMyParcels() external view returns (Parcel[] memory) {
        if(shipperIdByAddress[msg.sender]!=0){
            Parcel[] memory myParcels = new Parcel[](shipperById[shipperIdByAddress[msg.sender]].shippedParcels.length);
            for(uint i=0;i< shipperById[shipperIdByAddress[msg.sender]].shippedParcels.length;i++){
                myParcels[i] = parcels[shipperById[shipperIdByAddress[msg.sender]].shippedParcels[i]];
            }
            return myParcels;
        }
        else{
            Parcel[] memory myParcels = new Parcel[]
            (userParcels[msg.sender].length);
            for(uint i=0;i< userParcels[msg.sender].length;i++){
                myParcels[i] = parcels[userParcels[msg.sender][i]];
            }
            return myParcels;
        }
    }

    function viewParcel(uint pId) external view onlyActiveShipper returns(Parcel memory){
        if(parcels[pId].sender != msg.sender){revert Unauthorized();}
        return parcels[pId];
    }

    function viewMyShippedParcels() external view onlyActiveShipper returns(Parcel[] memory){
            
    }

    function viewMyPartners() external view onlyActiveShipper returns(Partner[] memory){
        Partner[] memory partners = new Partner[](shipperById[shipperIdByAddress[msg.sender]].myPartners.length);
        for(uint i=0;i< shipperById[shipperIdByAddress[msg.sender]].myPartners.length;i++){
            partners[i] = partnerById[shipperById[shipperIdByAddress[msg.sender]].myPartners[i]];
        }
        return partners;
    } 

    /// @notice Withdraw funds from the contract.
    /// @param amount Amount to withdraw.
    function withdrawFundsCollected(uint256 amount) external {
        if (msg.sender != owner) revert Unauthorized();
        token.transfer(msg.sender, amount);
    }

    function getMyType() external view returns (uint16){
        if (shipperIdByAddress[msg.sender] !=0) return 1;
        if(partnerIdByAddress[msg.sender] !=0)  return 2;
        if(msg.sender == owner) return 999;
        return 3;
    }

    function getMyId() external view returns (uint) {
        if(shipperIdByAddress[msg.sender] !=0) return shipperIdByAddress[msg.sender];
        if(partnerIdByAddress[msg.sender] !=0) return partnerIdByAddress[msg.sender];
        return 0;
    }

    function getShipperById(uint id) external view returns (Shipper memory){
        return shipperById[id];
    }

    function getMyPartnerById(uint id) external onlyActiveShipper view returns (Partner memory){
        require(id!=0 && partnerById[id].associatedShipper == msg.sender, "19");
        return partnerById[id];
    }

    function shipperDepositFund(uint amount) external payable onlyActiveShipper{
        require(amount > 0, "21");
        token.transferFrom(msg.sender, address(this), amount);
        shipperById[shipperIdByAddress[msg.sender]].insuranceDeposit = shipperById[shipperIdByAddress[msg.sender]].insuranceDeposit + amount;
    }
}
