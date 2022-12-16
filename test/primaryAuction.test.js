const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { signTypedDataAuctionERC721 } = require("./helper");
//require("dotenv").config();

let Admin_Address = process.env.ADMIN_ADDRESS;
//console.log();

describe("Testing Primary Auction Smart Contract", async function () {
  let NFTMarketplaceDeploy, PrimaryAuctionDeploy, PrimaryAuctionContractAddress;

  before(async function () {
    [owner, seller, buyer2, buyer3] = await ethers.getSigners();

    //deploying erc721 contract
    let { NAME, SYMBOL, BASE_TOKEN_URI } = process.env;
    const NFTMarketplaceUpgradeable = await ethers.getContractFactory(
      "NFTMarketplaceERC721"
    );

    NFTMarketplaceDeploy = await upgrades.deployProxy(
      NFTMarketplaceUpgradeable,
      [NAME, SYMBOL, BASE_TOKEN_URI, Admin_Address]
    );
    //console.log(NFTMarketplaceDeploy.address);

    //deploying primary Auction Marketplace;
    const PrimaryAuctionContract = await ethers.getContractFactory(
      "PrimaryAuctionNFTMarketPlace"
    );
    PrimaryAuctionDeploy = await PrimaryAuctionContract.deploy(
      [Admin_Address, 200],
      Admin_Address
    );

    PrimaryAuctionContractAddress = PrimaryAuctionDeploy.address;

    //console.log(PrimaryAuctionContractAddress);
  });

  it("Deployed NFT 2.0 Primary Auction Contract", async function () {
    const getDefaultAdminRole = await PrimaryAuctionDeploy.DEFAULT_ADMIN_ROLE();
    expect(
      await PrimaryAuctionDeploy.hasRole(getDefaultAdminRole, owner.address)
    ).is.true;
  });
  describe("Testing Auction and Bidding ", function () {
    it("Creating Primary Auction", async function () {
      let tokenID = 1;
      let basePrice = 100;
      let salePrice = 1000;
      let quantity = 1;
      let erc20Token = "0x0000000000000000000000000000000000000000";
      let auctioner = seller.address;
      let royaltyPercentage = 500;
      let NFTMarketplaceAddress = NFTMarketplaceDeploy.address;
      let intialBidderPrice = 150;
      let IPFSHASH = "ipfs:/abcd";
      let bidder = buyer2.address;
      let PrimaryAuctionContractAddress = PrimaryAuctionDeploy.address;

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
        IPFSHASH,
      ];
      await PrimaryAuctionDeploy.connect(buyer2).createAuction(
        auctionMetaData,
        signature,
        { value: 150 }
      );
    });

    it("Check whether Auction has Started", async function () {
      let tokenID = 1;
      let NFTMarketplaceAddress = NFTMarketplaceDeploy.address;
      let auctioner = seller.address;
      let intialBidderPrice = 150;
      let bidder = buyer2.address;
      let data = await PrimaryAuctionDeploy.getAuction(
        tokenID,
        NFTMarketplaceAddress,
        auctioner
      );
      expect(Number(data.tokenId)).to.equal(tokenID);
      expect(String(data.currentBidder)).to.equal(bidder);
      expect(Number(data.bidAmount)).to.equal(intialBidderPrice);
    });

    it("event is emitted when auction is created", async function () {
      let tokenID = 1;
      let basePrice = 100;
      let salePrice = 1000;
      let quantity = 1;
      let erc20Token = "0x0000000000000000000000000000000000000000";
      let auctioner = seller.address;
      let royaltyPercentage = 500;
      let NFTMarketplaceAddress = NFTMarketplaceDeploy.address;
      let intialBidderPrice = 250;
      let IPFSHASH = "ipfs:/abcd";
      let bidder = buyer2.address;
      let PrimaryAuctionContractAddress = PrimaryAuctionDeploy.address;

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
        IPFSHASH,
      ];
      await expect(
        PrimaryAuctionDeploy.connect(buyer2).createAuction(
          auctionMetaData,
          signature,
          { value: 250 }
        )
      )
        .to.emit(PrimaryAuctionDeploy, "AuctionCreated")
        .withArgs(
          tokenID,
          NFTMarketplaceAddress,
          auctioner,
          basePrice,
          salePrice,
          erc20Token,
          quantity
        );
    });

    it("reverts if base price is less than or equal than 0", async function () {
      let tokenID = 1;
      let basePrice = 0;
      let salePrice = 1000;
      let quantity = 1;
      let erc20Token = "0x0000000000000000000000000000000000000000";
      let auctioner = seller.address;
      let royaltyPercentage = 500;
      let NFTMarketplaceAddress = NFTMarketplaceDeploy.address;
      let intialBidderPrice = 250;
      let IPFSHASH = "ipfs:/abcd";
      let bidder = buyer2.address;
      let PrimaryAuctionContractAddress = PrimaryAuctionDeploy.address;

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
        IPFSHASH,
      ];
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
      await expect(
        PrimaryAuctionDeploy.connect(buyer2).createAuction(
          auctionMetaData,
          signature,
          { value: 250 }
        )
      ).to.be.revertedWith("Create Auction : Zero base price.");
    });

    it("reverts if sale price is less than or equal than 0", async function () {
      let tokenID = 1;
      let basePrice = 100;
      let salePrice = 0;
      let quantity = 1;
      let erc20Token = "0x0000000000000000000000000000000000000000";
      let auctioner = seller.address;
      let royaltyPercentage = 500;
      let NFTMarketplaceAddress = NFTMarketplaceDeploy.address;
      let intialBidderPrice = 250;
      let IPFSHASH = "ipfs:/abcd";
      let bidder = buyer2.address;
      let PrimaryAuctionContractAddress = PrimaryAuctionDeploy.address;

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
        IPFSHASH,
      ];
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
      await expect(
        PrimaryAuctionDeploy.connect(buyer2).createAuction(
          auctionMetaData,
          signature,
          { value: 260 }
        )
      ).to.be.revertedWith("Create Auction: Zero sale price.");
    });

    it("places bid", async function () {
      let tokenID = 1;
      let bidPrice = 260;
      let NFTMarketplaceAddress = NFTMarketplaceDeploy.address;
      let auctioner = seller.address;
      let royaltyPercentage = 500;
      let IPFSHASH = "ipfs:/abcd";
      let basePrice = 100;
      let salePrice = 1000;
      let quantity = 1;
      let erc20Token = "0x0000000000000000000000000000000000000000";
      const nftInfo = [auctioner, royaltyPercentage, IPFSHASH];

      let intialBidderPrice = 260;

      let bidder = buyer2.address;
      let PrimaryAuctionContractAddress = PrimaryAuctionDeploy.address;
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
        IPFSHASH,
      ];
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

      await PrimaryAuctionDeploy.connect(buyer2).placeBid(
        tokenID,
        bidPrice,
        NFTMarketplaceAddress,
        auctioner,
        nftInfo,
        signature,
        { value: 260 }
      );
    });

    it("emits an event when bid is placed ", async function () {
      let tokenID = 1;
      let bidPrice = 270;
      let NFTMarketplaceAddress = NFTMarketplaceDeploy.address;
      let auctioner = seller.address;
      let royaltyPercentage = 500;
      let IPFSHASH = "ipfs:/abcd";
      let basePrice = 100;
      let salePrice = 1000;
      let quantity = 1;
      let erc20Token = "0x0000000000000000000000000000000000000000";
      const nftInfo = [auctioner, royaltyPercentage, IPFSHASH];

      let intialBidderPrice = 150;

      let bidder = buyer2.address;
      let PrimaryAuctionContractAddress = PrimaryAuctionDeploy.address;

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
      await expect(
        PrimaryAuctionDeploy.connect(buyer2).placeBid(
          tokenID,
          bidPrice,
          NFTMarketplaceAddress,
          auctioner,
          nftInfo,
          signature,
          { value: 270 }
        )
      )
        .to.emit(PrimaryAuctionDeploy, "BidPlaced")
        .withArgs(
          tokenID,
          NFTMarketplaceAddress,
          auctioner,
          buyer2.address,
          erc20Token,
          quantity,
          bidPrice
        );
    });

    it("reverts when Admin is the bidder", async function () {
      let tokenID = 1;
      let bidderPrice = 270;
      let NFTMarketplaceAddress = NFTMarketplaceDeploy.address;
      let auctioner = seller.address;
      let royaltyPercentage = 500;
      let IPFSHASH = "ipfs:/abcd";
      let basePrice = 100;
      let salePrice = 1000;
      let quantity = 1;
      let erc20Token = "0x0000000000000000000000000000000000000000";
      const nftInfo = [auctioner, royaltyPercentage, IPFSHASH];

      let intialBidderPrice = 150;

      let bidder = buyer2.address;
      let PrimaryAuctionContractAddress = PrimaryAuctionDeploy.address;

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
      await expect(
        PrimaryAuctionDeploy.connect(owner).placeBid(
          tokenID,
          bidderPrice,
          NFTMarketplaceAddress,
          auctioner,
          nftInfo,
          signature,
          { value: 270 }
        )
      ).to.be.revertedWith("Place Bid: Admin Can Not Place Bid");
    });

    it("reverts when seller is the bidder ", async function () {
      let tokenID = 1;
      let bidderPrice = 270;
      let NFTMarketplaceAddress = NFTMarketplaceDeploy.address;
      let auctioner = seller.address;
      let royaltyPercentage = 500;
      let IPFSHASH = "ipfs:/abcd";
      let basePrice = 100;
      let salePrice = 1000;
      let quantity = 1;
      let erc20Token = "0x0000000000000000000000000000000000000000";
      const nftInfo = [auctioner, royaltyPercentage, IPFSHASH];
      let intialBidderPrice = 150;
      let bidder = buyer2.address;
      let PrimaryAuctionContractAddress = PrimaryAuctionDeploy.address;

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
      await expect(
        PrimaryAuctionDeploy.connect(seller).placeBid(
          tokenID,
          bidderPrice,
          NFTMarketplaceAddress,
          auctioner,
          nftInfo,
          signature,
          { value: 270 }
        )
      ).to.be.revertedWith("Place Bid : Seller not allowed to place bid");
    });

    it("reverts when price is less than base price ", async function () {
      let tokenID = 1;
      let bidderPrice = 50;
      let NFTMarketplaceAddress = NFTMarketplaceDeploy.address;
      let auctioner = seller.address;
      let royaltyPercentage = 500;
      let IPFSHASH = "ipfs:/abcd";
      let basePrice = 100;
      let salePrice = 1000;
      let quantity = 1;
      let erc20Token = "0x0000000000000000000000000000000000000000";
      const nftInfo = [auctioner, royaltyPercentage, IPFSHASH];

      let intialBidderPrice = 150;

      let bidder = buyer2.address;
      let PrimaryAuctionContractAddress = PrimaryAuctionDeploy.address;

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
      await expect(
        PrimaryAuctionDeploy.connect(buyer2).placeBid(
          tokenID,
          bidderPrice,
          NFTMarketplaceAddress,
          auctioner,
          nftInfo,
          signature,
          { value: 270 }
        )
      ).to.be.revertedWith("Place Bid : Price Less Than the base price");
    });

    it("reverts when price is less than initial bid price ", async function () {
      let tokenID = 1;
      let bidderPrice = 120;
      let intialBidderPrice = 150;
      let NFTMarketplaceAddress = NFTMarketplaceDeploy.address;
      let auctioner = seller.address;
      let royaltyPercentage = 500;
      let IPFSHASH = "ipfs:/abcd";
      let basePrice = 100;
      let salePrice = 1000;
      let quantity = 1;
      let erc20Token = "0x0000000000000000000000000000000000000000";
      const nftInfo = [auctioner, royaltyPercentage, IPFSHASH];

      let bidder = buyer2.address;
      let PrimaryAuctionContractAddress = PrimaryAuctionDeploy.address;

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
      await expect(
        PrimaryAuctionDeploy.connect(buyer2).placeBid(
          tokenID,
          bidderPrice,
          NFTMarketplaceAddress,
          auctioner,
          nftInfo,
          signature,
          { value: 150 }
        )
      ).to.be.revertedWith(
        "Place Bid : The price is less then the previous bid amount"
      );
    });
  });

  describe("Instant NFT purchase", function () {
    it("set minter permission to primaryAuction Contract and check ", async function () {
      const minter_role = await NFTMarketplaceDeploy.MINTER_ROLE();
      await NFTMarketplaceDeploy.addMinterOrPauser(
        PrimaryAuctionContractAddress,
        minter_role
      );
      expect(
        await NFTMarketplaceDeploy.hasRole(
          minter_role,
          PrimaryAuctionContractAddress
        )
      ).to.equal(true);
    });

    it("nft is purchased", async function () {
      let tokenID = 1;
      let bidderPrice = 340;
      let intialBidderPrice = 150;
      let NFTMarketplaceAddress = NFTMarketplaceDeploy.address;
      let auctioner = seller.address;
      let royaltyPercentage = 500;
      let IPFSHASH = "ipfs:/abcd";
      let basePrice = 100;
      let salePrice = 1000;
      let quantity = 1;
      let erc20Token = "0x0000000000000000000000000000000000000000";
      const nftInfo = [auctioner, royaltyPercentage, IPFSHASH];

      let bidder = buyer2.address;
      let PrimaryAuctionContractAddress = PrimaryAuctionDeploy.address;

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
        bidderPrice,
        quantity,
        erc20Token,
        auctioner,
        NFTMarketplaceAddress,
        auctioner,
        royaltyPercentage,
        IPFSHASH,
      ];
      await PrimaryAuctionDeploy.connect(buyer2).createAuction(
        auctionMetaData,
        signature,
        { value: 340 }
      );

      await PrimaryAuctionDeploy.connect(buyer2).instantBuyNFT(
        tokenID,
        NFTMarketplaceAddress,
        auctioner,
        nftInfo,
        signature,
        { value: 1000 }
      );
    });
    it("check if the nft purchaser is the owner of the nft ", async function () {
      let tokenID = 1;
      expect(await NFTMarketplaceDeploy.ownerOf(tokenID)).to.equal(
        buyer2.address
      );
    });
  });

  describe("Revertion Cases: Instant NFT Purchase", function () {
    it("reverts when sale price is less than bid price", async function () {
      let tokenID = 3;
      let NFTMarketplaceAddress = NFTMarketplaceDeploy.address;
      let auctioner = seller.address;
      let bidderPrice = 300;
      let royaltyPercentage = 500;
      let IPFSHASH = "ipfs:/abcd";
      let basePrice = 100;
      let salePrice = 250;
      let quantity = 1;
      let erc20Token = "0x0000000000000000000000000000000000000000";
      const nftInfo = [auctioner, royaltyPercentage, IPFSHASH];

      let bidder = buyer2.address;
      let PrimaryAuctionContractAddress = PrimaryAuctionDeploy.address;

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
      const auctionMetaData = [
        tokenID,
        basePrice,
        salePrice,
        bidderPrice,
        quantity,
        erc20Token,
        auctioner,
        NFTMarketplaceAddress,
        auctioner,
        royaltyPercentage,
        IPFSHASH,
      ];
      await PrimaryAuctionDeploy.connect(buyer2).createAuction(
        auctionMetaData,
        signature,
        { value: 300 }
      );

      await expect(
        PrimaryAuctionDeploy.connect(buyer2).instantBuyNFT(
          tokenID,
          NFTMarketplaceAddress,
          auctioner,
          nftInfo,
          signature,
          { value: 250 }
        )
      ).to.be.revertedWith("Auction Instant Buy: Bid exceeds sale price");
    });

    it("reverts when nft is purchased by admin", async function () {
      let tokenID = 3;
      let NFTMarketplaceAddress = NFTMarketplaceDeploy.address;
      let auctioner = seller.address;
      let bidderPrice = 320;
      let royaltyPercentage = 500;
      let IPFSHASH = "ipfs:/abcd";
      let basePrice = 100;
      let salePrice = 1000;
      let quantity = 1;
      let erc20Token = "0x0000000000000000000000000000000000000000";
      const nftInfo = [auctioner, royaltyPercentage, IPFSHASH];

      let bidder = buyer2.address;
      let PrimaryAuctionContractAddress = PrimaryAuctionDeploy.address;

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
        bidderPrice,
        quantity,
        erc20Token,
        auctioner,
        NFTMarketplaceAddress,
        auctioner,
        royaltyPercentage,
        IPFSHASH,
      ];
      await PrimaryAuctionDeploy.connect(buyer2).createAuction(
        auctionMetaData,
        signature,
        { value: 320 }
      );

      await expect(
        PrimaryAuctionDeploy.connect(owner).instantBuyNFT(
          tokenID,
          NFTMarketplaceAddress,
          auctioner,
          nftInfo,
          signature,
          { value: 1000 }
        )
      ).to.be.revertedWith(
        "Auction Instant Buy: Admin not allowed to perform purchase"
      );
    });
    it("reverts when seller purchases own nft  ", async function () {
      let tokenID = 3;
      let NFTMarketplaceAddress = NFTMarketplaceDeploy.address;
      let auctioner = seller.address;
      let bidderPrice = 340;
      let royaltyPercentage = 500;
      let IPFSHASH = "ipfs:/abcd";
      let basePrice = 100;
      let salePrice = 1000;
      let quantity = 1;
      let erc20Token = "0x0000000000000000000000000000000000000000";
      const nftInfo = [auctioner, royaltyPercentage, IPFSHASH];

      let bidder = buyer2.address;
      let PrimaryAuctionContractAddress = PrimaryAuctionDeploy.address;

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
      const auctionMetaData = [
        tokenID,
        basePrice,
        salePrice,
        bidderPrice,
        quantity,
        erc20Token,
        auctioner,
        NFTMarketplaceAddress,
        auctioner,
        royaltyPercentage,
        IPFSHASH,
      ];
      await PrimaryAuctionDeploy.connect(buyer2).createAuction(
        auctionMetaData,
        signature,
        { value: 340 }
      );

      await expect(
        PrimaryAuctionDeploy.connect(seller).instantBuyNFT(
          tokenID,
          NFTMarketplaceAddress,
          auctioner,
          nftInfo,
          signature,
          { value: 1000 }
        )
      ).to.be.revertedWith(
        "Auction Instant Buy: Seller not allowed to perform purchase"
      );
    });
  });

  describe("Fiat NFT Purchasing", function () {
    it("transfering fiat payment to the contract", async function () {
      let one_eth = ethers.utils.parseEther("1.0");
      let PrimaryAuctionContractAddress = PrimaryAuctionDeploy.address;

      const contractAmountFirst = await ethers.provider.getBalance(
        PrimaryAuctionContractAddress
      );

      await owner.sendTransaction({
        to: PrimaryAuctionContractAddress,
        value: one_eth,
      });

      const contractAmount = await ethers.provider.getBalance(
        PrimaryAuctionContractAddress
      );
      assert.isAtLeast(
        Number(contractAmount),
        Number(ethers.utils.parseUnits("1", 18))
      );
    });

    it("creating an auction for Fiat Purchase", async function () {
      let tokenID = 2;
      let NFTMarketplaceAddress = NFTMarketplaceDeploy.address;
      let auctioner = seller.address;
      let royaltyPercentage = 500;
      let IPFSHASH = "ipfs:/abcd";
      let basePrice = 100;
      let salePrice = ethers.utils.parseEther("1.0");
      let quantity = 1;
      let erc20Token = "0x0000000000000000000000000000000000000000";
      let intialBidderPrice = ethers.utils.parseEther("0.5");
      const nftInfo = [auctioner, royaltyPercentage, IPFSHASH];

      let bidder = buyer2.address;
      let PrimaryAuctionContractAddress = PrimaryAuctionDeploy.address;
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
        IPFSHASH,
      ];

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

      await PrimaryAuctionDeploy.connect(buyer2).createAuction(
        auctionMetaData,
        signature,
        { value: ethers.utils.parseEther("0.5") }
      );
    });
    it("Check Auction is Started", async function () {
      let tokenID = 2;
      let NFTMarketplaceAddress = NFTMarketplaceDeploy.address;
      let auctioner = seller.address;
      let intialBidderPrice = ethers.utils.parseEther("0.5");
      let bidder = buyer2.address;
      let data = await PrimaryAuctionDeploy.getAuction(
        tokenID,
        NFTMarketplaceAddress,
        auctioner
      );
      expect(Number(data.tokenId)).to.equal(tokenID);
      expect(String(data.currentBidder)).to.equal(bidder);
      expect(Number(data.bidAmount)).to.equal(
        Number(ethers.utils.parseUnits("0.5", 18))
      );
    });

    it("Purchase Nft with Fiat Payment", async function () {
      let tokenID = 2;
      let NFTMarketplaceAddress = NFTMarketplaceDeploy.address;
      let auctioner = seller.address;
      let royaltyPercentage = 500;
      let IPFSHASH = "ipfs:/abcd";
      let basePrice = 100;
      let salePrice = ethers.utils.parseEther("1.0");
      let quantity = 1;
      let erc20Token = "0x0000000000000000000000000000000000000000";
      let intialBidderPrice = ethers.utils.parseEther("0.5");
      const nftInfo = [auctioner, royaltyPercentage, IPFSHASH];

      let bidder = buyer2.address;
      let PrimaryAuctionContractAddress = PrimaryAuctionDeploy.address;

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

      await PrimaryAuctionDeploy.connect(owner).instantBuyNFTwithFiat(
        tokenID,
        NFTMarketplaceAddress,
        auctioner,
        bidder,
        nftInfo,
        signature,
        { value: ethers.utils.parseEther("1.0") }
      );
    });

    it("check if nft purchaser is the owner of NFT(FiatPayment)", async function () {
      let tokenID = 2;
      let bidder = buyer2.address;
      expect(bidder).to.equal(await NFTMarketplaceDeploy.ownerOf(tokenID));
    });
  });

  describe("Revertion Cases:NFT Fiat Purchase", async function () {
    it("revert when auctioner buys nft", async function () {
      let tokenID = 5;
      let NFTMarketplaceAddress = NFTMarketplaceDeploy.address;
      let auctioner = seller.address;
      let royaltyPercentage = 500;
      let IPFSHASH = "ipfs:/abcd";
      let basePrice = 100;
      let salePrice = ethers.utils.parseEther("1.0");
      let quantity = 1;
      let erc20Token = "0x0000000000000000000000000000000000000000";
      let intialBidderPrice = ethers.utils.parseEther("0.5");
      const nftInfo = [auctioner, royaltyPercentage, IPFSHASH];

      let bidder = buyer2.address;
      let PrimaryAuctionContractAddress = PrimaryAuctionDeploy.address;
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
        IPFSHASH,
      ];
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
      await PrimaryAuctionDeploy.connect(buyer2).createAuction(
        auctionMetaData,
        signature,
        { value: ethers.utils.parseEther("0.5") }
      );
      await expect(
        PrimaryAuctionDeploy.connect(owner).instantBuyNFTwithFiat(
          tokenID,
          NFTMarketplaceAddress,
          auctioner,
          auctioner,
          nftInfo,
          signature,
          { value: ethers.utils.parseEther("1.0") }
        )
      ).to.be.revertedWith(
        "Auction Instant Buy : Seller not allowed to perform purchase"
      );
    });
    it("reverts when bid price is greater than sale price", async function () {
      let tokenID = 5;
      let NFTMarketplaceAddress = NFTMarketplaceDeploy.address;
      let auctioner = seller.address;
      let royaltyPercentage = 500;
      let IPFSHASH = "ipfs:/abcd";
      let basePrice = 100;
      let salePrice = ethers.utils.parseEther("0.2");
      let quantity = 1;
      let erc20Token = "0x0000000000000000000000000000000000000000";
      let intialBidderPrice = ethers.utils.parseEther("0.6");
      const nftInfo = [auctioner, royaltyPercentage, IPFSHASH];

      let bidder = buyer2.address;
      let PrimaryAuctionContractAddress = PrimaryAuctionDeploy.address;
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
        IPFSHASH,
      ];

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

      await PrimaryAuctionDeploy.connect(buyer2).createAuction(
        auctionMetaData,
        signature,
        { value: ethers.utils.parseEther("0.6") }
      );
      await expect(
        PrimaryAuctionDeploy.connect(owner).instantBuyNFTwithFiat(
          tokenID,
          NFTMarketplaceAddress,
          auctioner,
          auctioner,
          nftInfo,
          signature,
          { value: salePrice }
        )
      ).to.be.revertedWith("Auction Instant Buy: Bid exceeds sale price");
    });
  });

  describe("Tests for settling auction", async function () {
    it("event is emitted when auction is settled", async function () {
      let tokenID = 7;
      let NFTMarketplaceAddress = NFTMarketplaceDeploy.address;
      let auctioner = seller.address;
      let royaltyPercentage = 500;
      let IPFSHASH = "ipfs:/abcd";
      let basePrice = 100;
      let salePrice = ethers.utils.parseEther("1.0");
      let quantity = 1;
      let erc20Token = "0x0000000000000000000000000000000000000000";
      let BidderPrice = ethers.utils.parseEther("0.7");
      const nftInfo = [auctioner, royaltyPercentage, IPFSHASH];

      let currentBidder = buyer2.address;
      let PrimaryAuctionContractAddress = PrimaryAuctionDeploy.address;
      //console.log(PrimaryAuctionContractAddress);
      const auctionMetaData = [
        tokenID,
        basePrice,
        salePrice,
        BidderPrice,
        quantity,
        erc20Token,
        auctioner,
        NFTMarketplaceAddress,
        auctioner,
        royaltyPercentage,
        IPFSHASH,
      ];
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
      await PrimaryAuctionDeploy.connect(buyer2).createAuction(
        auctionMetaData,
        signature,
        { value: BidderPrice }
      );

      await expect(
        PrimaryAuctionDeploy.connect(owner).settleAuction(
          tokenID,
          NFTMarketplaceAddress,
          auctioner,
          nftInfo,
          signature
        )
      )
        .to.emit(PrimaryAuctionDeploy, "AuctionSettled")
        .withArgs(
          tokenID,
          NFTMarketplaceAddress,
          auctioner,
          currentBidder,
          erc20Token,
          quantity,
          BidderPrice
        );
    });
    it("reverts when admin/auctioner is not the caller", async function () {
      let tokenID = 7;
      let NFTMarketplaceAddress = NFTMarketplaceDeploy.address;
      let auctioner = seller.address;
      let royaltyPercentage = 500;
      let IPFSHASH = "ipfs:/abcd";
      let basePrice = 100;
      let salePrice = ethers.utils.parseEther("1.0");
      let quantity = 1;
      let erc20Token = "0x0000000000000000000000000000000000000000";
      let BidderPrice = ethers.utils.parseEther("0.7");
      const nftInfo = [auctioner, royaltyPercentage, IPFSHASH];

      let bidder = buyer2.address;
      let PrimaryAuctionContractAddress = PrimaryAuctionDeploy.address;
      const auctionMetaData = [
        tokenID,
        basePrice,
        salePrice,
        BidderPrice,
        quantity,
        erc20Token,
        auctioner,
        NFTMarketplaceAddress,
        auctioner,
        royaltyPercentage,
        IPFSHASH,
      ];

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
      await PrimaryAuctionDeploy.connect(buyer2).createAuction(
        auctionMetaData,
        signature,
        { value: BidderPrice }
      );

      await expect(
        PrimaryAuctionDeploy.connect(buyer2).settleAuction(
          tokenID,
          NFTMarketplaceAddress,
          auctioner,
          nftInfo,
          signature
        )
      ).to.be.revertedWith(
        "Settle Auction : Restricted to auctioner or admin!"
      );
    });
  });

  describe("cancelling an auction", async function () {
    it("event is emitted when auction is settled", async function () {
      let tokenID = 8;
      let NFTMarketplaceAddress = NFTMarketplaceDeploy.address;
      let auctioner = seller.address;
      let royaltyPercentage = 500;
      let IPFSHASH = "ipfs:/abcd";
      let basePrice = 100;
      let salePrice = 1000;
      let quantity = 1;
      let erc20Token = "0x0000000000000000000000000000000000000000";
      let BidderPrice = 250;
      const nftInfo = [auctioner, royaltyPercentage, IPFSHASH];

      let currentBidder = buyer2.address;
      let PrimaryAuctionContractAddress = PrimaryAuctionDeploy.address;
      //console.log(PrimaryAuctionContractAddress);
      const auctionMetaData = [
        tokenID,
        basePrice,
        salePrice,
        BidderPrice,
        quantity,
        erc20Token,
        auctioner,
        NFTMarketplaceAddress,
        auctioner,
        royaltyPercentage,
        IPFSHASH,
      ];
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
      await PrimaryAuctionDeploy.connect(buyer2).createAuction(
        auctionMetaData,
        signature,
        { value: BidderPrice }
      );

      await expect(
        PrimaryAuctionDeploy.connect(owner).cancelAuction(
          tokenID,
          NFTMarketplaceAddress,
          auctioner,
          nftInfo,
          signature
        )
      )
        .to.emit(PrimaryAuctionDeploy, "AuctionCancelled")
        .withArgs(
          tokenID,
          NFTMarketplaceAddress,
          auctioner,
          quantity,
          erc20Token,
          BidderPrice,
          currentBidder
        );
    });
    it("reverts when admin/auctioner is not the caller", async function () {
      let tokenID = 8;
      let NFTMarketplaceAddress = NFTMarketplaceDeploy.address;
      let auctioner = seller.address;
      let royaltyPercentage = 500;
      let IPFSHASH = "ipfs:/abcd";
      let basePrice = 100;
      let salePrice = 1000;
      let quantity = 1;
      let erc20Token = "0x0000000000000000000000000000000000000000";
      let BidderPrice = 250;
      const nftInfo = [auctioner, royaltyPercentage, IPFSHASH];

      let bidder = buyer2.address;
      let PrimaryAuctionContractAddress = PrimaryAuctionDeploy.address;
      const auctionMetaData = [
        tokenID,
        basePrice,
        salePrice,
        BidderPrice,
        quantity,
        erc20Token,
        auctioner,
        NFTMarketplaceAddress,
        auctioner,
        royaltyPercentage,
        IPFSHASH,
      ];

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
      await PrimaryAuctionDeploy.connect(buyer2).createAuction(
        auctionMetaData,
        signature,
        { value: 250 }
      );

      await expect(
        PrimaryAuctionDeploy.connect(buyer2).cancelAuction(
          tokenID,
          NFTMarketplaceAddress,
          auctioner,
          nftInfo,
          signature
        )
      ).to.be.revertedWith("Cancel Auction: Restricted to auctioner or admin!");
    });
  });
});
