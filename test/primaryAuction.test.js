const { assert, expect } = require("chai");
const { ethers } = require("hardhat");
const { signTypedDataAuctionERC721 } = require("./helper");

describe("primary Auction", async function () {
  let PrimaryAuctionNFTMarketPlace,
    primaryAuctionNFT,
    accounts,
    AUCTIONER,
    ROYALTY_RECEIVER,
    RECEIVER,
    NFT,
    ERC20,
    primaryAuction;
  const TOKEN_ID = 1;
  const BASE_PRICE = 5;
  const SALE_PRICE = 10;
  const BID_PRICE = 15;
  const QUANTITY = 2;
  const ROYALTY_PERCENTAGE = 2000;
  const BASE_TOKEN_URI = "ipfs:/abcd";

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    AUCTIONER = accounts[0];
    RECEIVER = accounts[1];
    ROYALTY_RECEIVER = accounts[2];

    const MyTokenDeploy = await ethers.getContractFactory("MyToken");
    const myToken = await MyTokenDeploy.deploy();

    ERC20 = await myToken.deployed();
    //console.log(ERC20.address);
    console.log("hi");
    const NFTMarketplaceERC721 = await ethers.getContractFactory(
      "NFTMarketplaceERC721"
    );
    const { ADMIN, NAME, SYMBOL } = process.env;
    const NFTMarketPlace = await upgrades.deployProxy(
      NFTMarketplaceERC721,
      [NAME, SYMBOL, BASE_TOKEN_URI, ADMIN],
      { initializer: "initialize" }
    );
    NFT = await NFTMarketPlace.deployed();
    console.log("hi");

    //console.log(NFT.address);

    const { ROOT_ADMIN, PERCENTAGE } = process.env;
    PrimaryAuctionNFTMarketPlace = await ethers.getContractFactory(
      "PrimaryAuctionNFTMarketPlace"
    );
    primaryAuctionNFT = await PrimaryAuctionNFTMarketPlace.deploy(
      [RECEIVER.address, PERCENTAGE],
      ROOT_ADMIN
    );
    primaryAuction = await primaryAuctionNFT.deployed();
    console.log("hi");
  });

  it("deploys the contract", async function () {
    console.log("Primary Auction deployed to :", primaryAuction.address);
  });

  it("event is emitted when auction is created", async function () {
    console.log("here");
    const signature = await signTypedDataAuctionERC721(
      TOKEN_ID,
      BASE_PRICE,
      SALE_PRICE,
      QUANTITY,
      ERC20.address,
      AUCTIONER.address,
      NFT.address,
      ROYALTY_RECEIVER.address,
      ROYALTY_PERCENTAGE,
      BASE_TOKEN_URI,
      primaryAuction.address
    );
    console.log({ signature });

    //console.log(signature);
    console.log("hi");
    await expect(
      primaryAuctionNFT
        .connect(AUCTIONER)
        .createAuction(
          [
            TOKEN_ID,
            BASE_PRICE,
            SALE_PRICE,
            BID_PRICE,
            QUANTITY,
            ERC20.address,
            AUCTIONER.address,
            NFT.address,
            ROYALTY_RECEIVER.address,
            ROYALTY_PERCENTAGE,
            BASE_TOKEN_URI,
          ],
          signTypedDataAuctionERC721(
            TOKEN_ID,
            BASE_PRICE,
            SALE_PRICE,
            QUANTITY,
            ERC20.address,
            AUCTIONER.address,
            NFT.address,
            ROYALTY_RECEIVER.address,
            ROYALTY_PERCENTAGE,
            BASE_TOKEN_URI,
            primaryAuction.address
          )
        )
    )
      .to.emit(primaryAuctionNFT, "AuctionCreated")
      .withArgs(
        TOKEN_ID,
        NFT.address,
        AUCTIONER.address,
        BASE_PRICE,
        SALE_PRICE,
        ERC20.address,
        QUANTITY
      );
  });

  // it("reverts if base price is less than 0", async function () {
  //   const BASE_PRICE = 0;
  //   await expect(
  //     primaryAuctionNFT
  //       .connect(AUCTIONER)
  //       .createAuction(
  //         [
  //           TOKEN_ID,
  //           BASE_PRICE,
  //           SALE_PRICE,
  //           BID_PRICE,
  //           QUANTITY,
  //           ERC20_ADDRESS,
  //           AUCTIONER.address,
  //           NFT_ADDRESS,
  //           ROYALTY_RECEIVER.address,
  //           ROYALTY_PERCENTAGE,
  //           BASE_TOKEN_URI,
  //         ],
  //         "0x12345667899556777544"
  //       )
  //   ).to.be.revertedWith("Create Auction : Zero base price.");
  // });
});
//module.exports = { TOKEN_ID };
