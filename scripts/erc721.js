const { ethers, upgrades } = require("hardhat");
//const { deployProxy } = require("@openzeppelin/hardhat-upgrades");

async function main() {
  const NFTMarketplaceERC721 = await ethers.getContractFactory(
    "NFTMarketplaceERC721"
  );
  const { ADMIN, NAME, SYMBOL, BASE_TOKEN_URI } = process.env;
  const NFTMarketPlace = await upgrades.deployProxy(NFTMarketplaceERC721, [
    NAME,
    SYMBOL,
    BASE_TOKEN_URI,
    ADMIN,
  ]);
  await NFTMarketPlace.deployed();

  console.log("erc721 deployed to :", NFTMarketPlace.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
