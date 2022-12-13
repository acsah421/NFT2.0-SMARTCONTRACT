const { ethers, network } = require("hardhat");
//require(dotenv).config();

async function main() {
  const MyTokenDeploy = await ethers.getContractFactory("MyToken");

  console.log("Deploying contract");
  const myToken = await MyTokenDeploy.deploy();
  //console.log("Contract owner:", contract_owner.address);

  await myToken.deployed();
  console.log(`Deployed erc20 contract to :${myToken.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
