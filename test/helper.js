const { ethers } = require("ethers");
const chainID = 5;
const adminPrivateKey ="use your private";
const Name = "PrimaryAuctionNFTMarketPlace";
const Version = "0.0.1";
const wallet = new ethers.Wallet(adminPrivateKey);

const signTypedDataAuctionERC721 = async (
  tokenId,
  basePrice,
  salePrice,
  quantity,
  erc20Token,
  seller,
  nftAddress,
  royaltyReceiver,
  royaltyPercentage,
  IPFSHash,
  contract
) => {
  let signature = await wallet._signTypedData(
    {
      name: Name,
      version: Version,
      chainId: chainID,
      verifyingContract: contract,
    },
    // Types
    {
      Auction: [
        { name: "tokenId", type: "uint256" },
        { name: "basePrice", type: "uint256" },
        { name: "salePrice", type: "uint256" },
        { name: "quantity", type: "uint256" },
        { name: "erc20Token", type: "address" },
        { name: "seller", type: "address" },
        { name: "nftAddress", type: "address" },
        { name: "royaltyReceiver", type: "address" },
        { name: "royaltyPercentage", type: "uint256" },
        { name: "IPFSHash", type: "string" },
      ],
    },
    // Value
    {
      tokenId,
      basePrice,
      salePrice,
      quantity,
      erc20Token,
      seller,
      nftAddress,
      royaltyReceiver,
      royaltyPercentage,
      IPFSHash,
    }
  );
  //console.log("Mint signature", signature);
  return signature;
};
 module.exports = { signTypedDataAuctionERC721 };
// signTypedDataAuctionERC721(
//   1,
//   100,
//   1000,
//   1,
//   "0x0000000000000000000000000000000000000000",
//   "0xDfAd87e691A73d8EA78198D753e1B7Fd0051d431",
//   "0x9CCaEbCCdcB5dd5bF2DBDFf363F4B577863e54A6",
//   "0xDfAd87e691A73d8EA78198D753e1B7Fd0051d431",
//   500,
//   "abc",
//   "0xe401dF22417EaCE64De8f9057Ed61216af978584"
// );