const { ethers } = require("ethers");

const chainID = 31337;
const adminPrivateKey =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const Name = "PrimaryAuctionNFTMarketPlace";
const Version = "1.0.0";

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
  console.log("signer address:", wallet.address);
  console.log(wallet);
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
        { name: "nftaddress", type: "address" },
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
  console.log("Mint signature", signature);
  return signature;
};
module.exports = { signTypedDataAuctionERC721 };
