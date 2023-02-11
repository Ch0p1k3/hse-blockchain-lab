const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("EmeraldToken.sol", () => {
    let contractFactory;
    let contract;
    let owner;
    let alice;
    let bob;
    let initialSupply;
    let ownerAddress;
    let aliceAddress;
    let bobAddress;

    beforeEach(async () => {
        initialSupply = 100000;
        [owner, alice, bob] = await ethers.getSigners();
        contractFactory = await ethers.getContractFactory("EmeraldToken");
        contract = await contractFactory.deploy(initialSupply);
        ownerAddress = await owner.getAddress();
        aliceAddress = await alice.getAddress();
        bobAddress = await bob.getAddress();
    });

    describe("Correct setup", () => {
        it("should be named 'Emerald'", async () => {
            const name = await contract.name();
            expect(name).to.equal("Emerald");
        });
        it("should have correct supply", async () => {
            const supply = await contract.totalSupply();
            expect(supply).to.equal(initialSupply);
        });
        it("owner should have all the supply", async () => {
            const ownerBalance = await contract.balanceOf(ownerAddress);
            expect(ownerBalance).to.equal(initialSupply);
        });
    });

    describe("Core", () => {
        it("owner should transfer to Alice and update balances", async () => {
            const transferAmount = 1000;
            let aliceBalance = await contract.balanceOf(aliceAddress);
            expect(aliceBalance).to.equal(0);
            await contract.transfer(aliceAddress, transferAmount);
            aliceBalance = await contract.balanceOf(aliceAddress);
            expect(aliceBalance).to.equal(transferAmount);
        });
        it("owner should transfer to Alice and Alice to Bob", async () => {
            const transferAmount = 1000;
            await contract.transfer(aliceAddress, transferAmount); // contract is connected to the owner.
            let bobBalance = await contract.balanceOf(bobAddress);
            expect(bobBalance).to.equal(0);
            await contract.connect(alice).transfer(bobAddress, transferAmount);
            bobBalance = await contract.balanceOf(bobAddress);
            expect(bobBalance).to.equal(transferAmount);
        });
        it("should fail by depositing more than current balance", async () => {
            const txFailure = initialSupply + 1;
            await expect(contract.transfer(txFailure, aliceAddress)).to.be.revertedWith("");
        });
        it("mint function is working only for owner", async () => {
            const mintAmount = 1000;
            await expect(contract.connect(alice).mint(aliceAddress, mintAmount)).to.be.revertedWith("Ownable: caller is not the owner");
        });
        it("mint function increase supply", async () => {
            const mintAmount = 1000;
            await contract.mint(aliceAddress, mintAmount);
            const supply = await contract.totalSupply();
            expect(supply).to.equal(initialSupply + mintAmount);
            const bobBalance = await contract.balanceOf(bobAddress);
            expect(bobBalance).to.equal(0);
            const aliceBalance = await contract.balanceOf(aliceAddress);
            expect(aliceBalance).to.equal(1000);
            const ownerBalance = await contract.balanceOf(ownerAddress);
            expect(ownerBalance).to.equal(initialSupply);
        });
        it("allowance returns the zero by default of tokens that spender will be allowed to spend on behalf of owner through transferFrom", async () => {
            const allowance = await contract.allowance(ownerAddress, aliceAddress);
            expect(allowance).to.be.equal(0);
        });
        it('allowance is working', async function () {
            const approveAmount = 1000;
            await contract.connect(owner).approve(aliceAddress, approveAmount);
            const allowance = await contract.allowance(ownerAddress, aliceAddress);
            expect(allowance).to.equal(approveAmount);
        });
        it('transferFrom is working', async function () {
            const transferAmount = 1000;
            await contract.transfer(aliceAddress, transferAmount);
            expect(await contract.balanceOf(aliceAddress)).to.be.equal(transferAmount);
            await contract.connect(alice).approve(ownerAddress, transferAmount);
            await contract.transferFrom(aliceAddress, ownerAddress, transferAmount);
            const ownerBalance = await contract.balanceOf(ownerAddress);
            expect(ownerBalance).to.equal(initialSupply);
            const aliceBalance = await contract.balanceOf(aliceAddress);
            expect(aliceBalance).to.equal(0);
            const bobBalance = await contract.balanceOf(bobAddress);
            expect(bobBalance).to.equal(0);
        });
        it('transferFrom is failed when allowance value is less then in arg', async function () {
            const transferAmount = 1000;
            await contract.transfer(aliceAddress, transferAmount);
            expect(await contract.balanceOf(aliceAddress)).to.be.equal(transferAmount);
            await contract.connect(alice).approve(ownerAddress, transferAmount);
            await expect(contract.transferFrom(aliceAddress, ownerAddress, transferAmount + 1)).to.be.revertedWith("ERC20: insufficient allowance");
        });
        it('increaseAllowance is working', async function () {
            const increaseAmount = 1000;
            await contract.connect(alice).approve(ownerAddress, increaseAmount);
            const prevAmount = parseInt(await contract.allowance(aliceAddress, ownerAddress));
            await contract.connect(alice).increaseAllowance(ownerAddress, increaseAmount);
            expect((await contract.allowance(aliceAddress, ownerAddress))).to.equal(prevAmount + increaseAmount);
        });
        it('decreaseAllowance is working', async function () {
            const approveAmount = 1000;
            const decreaseAmount = 100;
            await contract.connect(alice).approve(ownerAddress, approveAmount);
            const prevAmount = parseInt(await contract.allowance(aliceAddress, ownerAddress));
            await contract.connect(alice).decreaseAllowance(ownerAddress, decreaseAmount);
            expect((await contract.allowance(aliceAddress, ownerAddress))).to.equal(prevAmount - decreaseAmount);
        });
    });
});

