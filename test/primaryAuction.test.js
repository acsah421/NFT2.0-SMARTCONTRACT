const { expect } = require("chai");
const { ethers } = require("hardhat");
const { signTypedDataAuctionERC721 } = require("./helper");
let AdminAddress="use your address";

describe("Testing Primary Auction Smart Contract", async function () {
  let NFT2_0MarketplaceInstance, PrimaryAuctionContractInstance
  
  before(async function () {
    [owner, buyer1, buyer2] = await ethers.getSigners();

    //deploying erc20 token
    // const MyTokenDeploy = await ethers.getContractFactory("MyToken");
    // myToken = await MyTokenDeploy.deploy();

    //deploying erc721 contract
    const NFT2_0MarketplaceUpgradable = await ethers.getContractFactory("NFTMarketplaceERC721");
    NFT2_0MarketplaceInstance = await upgrades.deployProxy(NFT2_0MarketplaceUpgradable, ["NFT Marketplace V2.0","NFT2.0","https://gateway.pinata.cloud/ipfs/",AdminAddress]);

    //deploying primary Auction Marketplace;
    const PrimaryAuctionContract = await ethers.getContractFactory("PrimaryAuctionNFTMarketPlace");
    PrimaryAuctionContractInstance = await PrimaryAuctionContract.deploy([AdminAddress,200],AdminAddress);

    //console.log(primaryAuction.address);
  });

  it("Deployed NFT 2.0 Primary Auction Contract", async function () {
    
    const getDefaultAdminRole =  await PrimaryAuctionContractInstance.DEFAULT_ADMIN_ROLE();
    expect(await PrimaryAuctionContractInstance.hasRole(getDefaultAdminRole,owner.address)).is.true;
  });

  it("Creating Primary Auction", async function () {
    // NFT Auction Data
    let tokenID = 1;
    let basePrice=100;
    let salePrice=1000;
    let quantity=1;
    let erc20Token = "0x0000000000000000000000000000000000000000";
    let auctioner = buyer1.address;
    let royaltyPercentage =500
    let NFTMarketplaceAddress = NFT2_0MarketplaceInstance.address;
    let intialBidderPrice = 250;
    let IPFSHASH="abc"
    let bidder = buyer2.address;
    let PrimaryAuctionContractAddress = PrimaryAuctionContractInstance.address

    const signature = await signTypedDataAuctionERC721(
      tokenID,
      basePrice,
      salePrice,
      quantity,
      erc20Token,
      auctioner,
      NFTMarketplaceAddress,
      auctioner,
      royaltyPercentage,
      IPFSHASH,
      PrimaryAuctionContractAddress
    );
    //console.log(signature);
    const auctionMetaData = [
      tokenID,
      basePrice,
      salePrice,
      intialBidderPrice,
      quantity,
      erc20Token,
      auctioner,
      NFTMarketplaceAddress,
      auctioner,
      royaltyPercentage,
      IPFSHASH
    ];
   const tx =await PrimaryAuctionContractInstance.connect(buyer2).createAuction(auctionMetaData, signature, { value: 250 })
   
   // To check logs and events emited
   //const receipt = await tx.wait()
   
   // Receipt should now contain the events
   //console.log(receipt.events)

   // Receipt should now contain the logs
   //console.log(receipt.logs)
  });

  it("Check Auction is Started", async function () {
    let tokenID = 1;
    let NFTMarketplaceAddress = NFT2_0MarketplaceInstance.address;
    let auctioner = buyer1.address;
    let intialBidderPrice = 250;
    let bidder = buyer2.address;
    console.log("NFT",NFTMarketplaceAddress);
  let data = await PrimaryAuctionContractInstance.getAuction(tokenID,NFTMarketplaceAddress,auctioner);
    console.log(data);
    expect(Number(data.tokenId)).to.equal(tokenID);
    expect(String(data.currentBidder)).to.equal(bidder);
    expect(Number(data.bidAmount)).to.equal(intialBidderPrice);
    
  });
});

