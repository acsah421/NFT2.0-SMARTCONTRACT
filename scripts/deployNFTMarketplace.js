const { artifacts, ethers, upgrades } = require('hardhat')

async function main () {
  console.log('Deploying NFT Smart Contract')
  const accounts = await ethers.getSigners()

  const NFT_CONTRACT = await ethers.getContractFactory('NFTMarketplaceERC721')

  const nftContract = await upgrades.deployProxy(NFT_CONTRACT, ["NFT Marketplace V2.0","NFT2.0","https://gateway.pinata.cloud/ipfs/","0xf2FB2457784B4C4719f89C2A686d95C5fdBA5C80"], { initializer: 'initialize' })
  await nftContract.deployed()

  console.log('NFT contract deployed to:', nftContract.address)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})