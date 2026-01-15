// @ts-ignore
import { ethers, network, deployments } from "hardhat"
import { Raffle } from "../typechain-types"

async function pickWinner() {
    const raffleAddress = (await deployments.get("Raffle")).address
    const raffle: Raffle = await ethers.getContractAt("Raffle", raffleAddress)
    const checkData = ethers.keccak256(ethers.toUtf8Bytes(""))
    
    console.log("Checking if upkeep is needed...")
    const upkeepNeeded = await raffle.checkUpkeep.staticCall(checkData)
    
    if (upkeepNeeded[0]) {
        console.log("Upkeep needed! Triggering winner selection...")
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
            console.log(`Fulfilling random words for RequestId: ${foundRequestId}`)
            const vrfCoordinatorV2MockAddress = (await deployments.get("VRFCoordinatorV2Mock")).address
            const vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock", vrfCoordinatorV2MockAddress)
            await vrfCoordinatorV2Mock.fulfillRandomWords(foundRequestId, raffle.target)
            
            const recentWinner = await raffle.getRecentWinner()
            console.log(`🏆 Success! The winner is: ${recentWinner}`)
        }
    } else {
        console.log("No upkeep needed! Ensure the raffle is open and has players.")
    }
}

pickWinner()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
