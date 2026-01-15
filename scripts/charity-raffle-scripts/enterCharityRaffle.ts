// @ts-ignore
import { ethers, deployments } from "hardhat"
import { CharityRaffle } from "../../typechain-types"

async function enterCharityRaffle(): Promise<void> {
    const charityRaffleAddress = (await deployments.get("CharityRaffle")).address
    const charityRaffle: CharityRaffle = await ethers.getContractAt("CharityRaffle", charityRaffleAddress)
    const entranceFee: bigint = await charityRaffle.getEntranceFee()
    console.log(`Entering Charity Raffle with fee: ${ethers.formatEther(entranceFee)} ETH`)
    const tx = await charityRaffle.enterRaffle(0, { value: entranceFee + 1n })
    await tx.wait(1)
    console.log("Entered Charity Raffle!")
}

enterCharityRaffle()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
