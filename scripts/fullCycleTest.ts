// @ts-ignore
import { ethers, network, deployments } from "hardhat"
import { Raffle } from "../typechain-types"

async function fullCycleTest() {
    console.log("🏁 Starting Full-Cycle Raffle Test...")
    
    const raffleAddress = (await deployments.get("Raffle")).address
    const raffle: Raffle = await ethers.getContractAt("Raffle", raffleAddress)
    const entranceFee: bigint = await raffle.getEntranceFee()
    const signers = await ethers.getSigners()
    
    // 1. Multiple entries
    console.log(`🎟️ Seeding raffle with 5 players (Fee: ${ethers.formatEther(entranceFee)} ETH)...`)
    for (let i = 1; i <= 5; i++) {
        const player = signers[i]
        const tx = await raffle.connect(player).enterRaffle({ value: entranceFee + 1n })
        await tx.wait(1)
        console.log(`   - Player #${i} (${player.address}) entered.`)
    }

    // 2. Wait for interval if necessary (local nodes solve quickly, but let's be safe)
    console.log("⏳ Waiting for raffle interval...")
    await network.provider.send("evm_increaseTime", [31])
    await network.provider.send("evm_mine", [])

    // 3. Trigger Upkeep
    const checkData = ethers.keccak256(ethers.toUtf8Bytes(""))
    console.log("🔍 Checking upkeep status...")
    const upkeepNeeded = await raffle.checkUpkeep.staticCall(checkData)
    
    if (upkeepNeeded[0]) {
        console.log("🎲 Upkeep valid. Picking a winner...")
        const tx = await raffle.performUpkeep(checkData)
        const txReceipt = await tx.wait(1)
        
        // Find the event in logs
        const raffleInterface = raffle.interface
        let foundRequestId: string | undefined
        for (const log of txReceipt!.logs) {
            try {
                const parsed = raffleInterface.parseLog(log as any)
                if (parsed?.name === "RequestedRaffleWinner") {
                    foundRequestId = parsed.args.requestId
                    break
                }
            } catch (e) { continue }
        }

        if (foundRequestId) {
            console.log(`📡 Fulfilling VRF Request: ${foundRequestId}`)
            const vrfCoordinatorV2MockAddress = (await deployments.get("VRFCoordinatorV2Mock")).address
            const vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock", vrfCoordinatorV2MockAddress)
            await vrfCoordinatorV2Mock.fulfillRandomWords(foundRequestId, raffle.target)
            
            // 4. Report Result
            const recentWinner = await raffle.getRecentWinner()
            console.log("\n================================================")
            console.log(`🏆 WINNER SELECTED: ${recentWinner}`)
            console.log("================================================\n")
        }
    } else {
        console.log("❌ Error: Upkeep not needed. Check raffle state.")
    }
}

fullCycleTest()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
