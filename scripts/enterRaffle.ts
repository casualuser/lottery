// @ts-ignore
import { ethers, deployments } from "hardhat"
import { Raffle } from '../typechain-types'

async function enterRaffle(): Promise<void> {
    const raffleAddress = (await deployments.get("Raffle")).address
    const raffle: Raffle = await ethers.getContractAt("Raffle", raffleAddress)
    const entranceFee: bigint = await raffle.getEntranceFee()
    console.log(`Entering Raffle with fee: ${ethers.formatEther(entranceFee)} ETH`)
    const tx = await raffle.enterRaffle({ value: entranceFee + 1n })
    await tx.wait(1)
    console.log("Entered!")
}

enterRaffle()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
