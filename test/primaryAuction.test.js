const { assert, expect } = require("chai");
const { ethers } = require("hardhat");
const { signTypedDataAuctionERC721 } = require("./helper");

describe("primary Auction", async function () {
  let PrimaryAuctionNFTMarketPlace,
    primaryAuctionNFT,
    owner,
    buyer1,
    buyer2,
    auctioner,
    ERC20,
    primaryAuction,
    NFTMarketPlace,
    myToken;
  const TOKEN_ID = 1;
  const BASE_PRICE = 1000;
  const SALE_PRICE = 2000;
  const BID_PRICE = 3000;
  const QUANTITY = 1;
  const ROYALTY_PERCENTAGE = 500;
  const BASE_TOKEN_URI = "ipfs:/abcd";
  const ERC20_ADDRESS = "0x0000000000000000000000000000000000000000";

  beforeEach(async function () {
    [owner, buyer1, auctioner] = await ethers.getSigners();

    //deploying erc20 token
    // const MyTokenDeploy = await ethers.getContractFactory("MyToken");
    // myToken = await MyTokenDeploy.deploy();

    //deploying erc721 contract
    const NFTMarketplaceERC721 = await ethers.getContractFactory(
      "NFTMarketplaceERC721"
    );
    const { NAME, SYMBOL } = process.env;
    NFTMarketPlace = await upgrades.deployProxy(NFTMarketplaceERC721, [
      NAME,
      SYMBOL,
      BASE_TOKEN_URI,
      owner.address,
    ]);

    //deploying primary Auction Marketplace;

    PrimaryAuctionNFTMarketPlace = await ethers.getContractFactory(
      "PrimaryAuctionNFTMarketPlace"
    );
    primaryAuctionNFT = await PrimaryAuctionNFTMarketPlace.deploy(
      [owner.address, ROYALTY_PERCENTAGE],
      owner.address
    );

    //console.log(primaryAuction.address);
  });

  it("deploys the contract", async function () {
    console.log("Primary Auction deployed to :", primaryAuctionNFT.address);
  });

  it("event is emitted when auction is created", async function () {
    // console.log("here");
    const getDefaultAdminRole = await primaryAuctionNFT.DEFAULT_ADMIN_ROLE();
    const getData = await primaryAuctionNFT.hasRole(
      getDefaultAdminRole,
      owner.address
    );
    console.log(getData);
    const signature = await signTypedDataAuctionERC721(
      TOKEN_ID,
      BASE_PRICE,
      SALE_PRICE,
      QUANTITY,
      ERC20_ADDRESS,
      buyer1.address,
      NFTMarketPlace.address,
      buyer1.address,
      ROYALTY_PERCENTAGE,
      BASE_TOKEN_URI,
      primaryAuctionNFT.address
    );
    console.log(signature);

    const metadata = [
      TOKEN_ID,
      BASE_PRICE,
      SALE_PRICE,
      BID_PRICE,
      QUANTITY,
      ERC20_ADDRESS,
      auctioner.address,
      NFTMarketPlace.address,
      owner.address,
      ROYALTY_PERCENTAGE,
      BASE_TOKEN_URI,
    ];

    //console.log(signature);
    //console.log("hi");
    await expect(
      primaryAuctionNFT
        .connect(buyer1)
        .createAuction(metadata, signature, { value: BID_PRICE })
    )
      .to.emit(primaryAuctionNFT, "AuctionCreated")
      .withArgs(
        TOKEN_ID,
        NFTMarketPlace.address,
        auctioner.address,
        BASE_PRICE,
        SALE_PRICE,
        ERC20_ADDRESS,
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
