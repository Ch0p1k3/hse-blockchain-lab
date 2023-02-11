const { ethers } = require("hardhat")

const main = async () => {
    const [deployer] = await ethers.getSigners();
    console.log(`Address deploying the contract --> ${deployer.address}`);

    const tokenFactory = await ethers.getContractFactory("EmeraldToken");
    const contract = await tokenFactory.deploy(100000);

    console.log(`Token Contract Address --> ${contract.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1)
    })
