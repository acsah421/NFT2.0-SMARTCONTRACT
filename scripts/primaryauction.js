const { ethers, network } = require("hardhat");


async function main() {
  const { RECEIVER, ROOT_ADMIN, PERCENTAGE } = process.env;
  const PrimaryAuctionNFTMarketPlace = await ethers.getContractFactory(
    "PrimaryAuctionNFTMarketPlace"
  );

  console.log("Deploying contract");
  const PrimaryAuctionNFT = await PrimaryAuctionNFTMarketPlace.deploy(
    [RECEIVER, PERCENTAGE],
    ROOT_ADMIN
  );
  //console.log("Contract owner:", contract_owner.address);

  await PrimaryAuctionNFT.deployed();
  console.log(
    `Deployed primary auction contract to :${PrimaryAuctionNFT.address}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
