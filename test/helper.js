const { ethers } = require("ethers");
const chainID = process.env.CHAIN_ID;
const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
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
  return signature;
};
module.exports = { signTypedDataAuctionERC721 };
