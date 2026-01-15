// @ts-ignore
import { ethers, network, deployments } from "hardhat"
import { CharityRaffle } from "../../typechain-types"

async function mockKeepers() {
    const charityRaffleAddress = (await deployments.get("CharityRaffle")).address
    const charityRaffle: CharityRaffle = await ethers.getContractAt("CharityRaffle", charityRaffleAddress)
    const checkData = ethers.keccak256(ethers.toUtf8Bytes(""))
    const upkeepNeeded = await charityRaffle.checkUpkeep.staticCall(checkData)
    
    if (upkeepNeeded[0]) {
        console.log("Upkeep needed! Performing upkeep...")
        const tx = await charityRaffle.performUpkeep(checkData)
        const txReceipt = await tx.wait(1)
        
        // Find the event in logs
        const charityInterface = charityRaffle.interface
        let foundRequestId: string | undefined
        for (const log of txReceipt!.logs) {
            try {
                const parsed = charityInterface.parseLog(log as any)
                if (parsed?.name === "RequestedRaffleWinner") {
                    foundRequestId = parsed.args.requestId
                    break
                }
            } catch (e) { continue }
        }

        console.log(`Performed upkeep with RequestId: ${foundRequestId}`)
        if (foundRequestId && network.config.chainId == 31337) {
            await mockVrf(foundRequestId, charityRaffle)
        }
    } else {
        console.log("No upkeep needed!")
    }
}

async function mockVrf(requestId: string, charityRaffle: CharityRaffle) {
    console.log("We on a local network? Ok let's pretend...")
    const vrfCoordinatorV2MockAddress = (await deployments.get("VRFCoordinatorV2Mock")).address
    const vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock", vrfCoordinatorV2MockAddress)
    await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, charityRaffle.target)
    console.log("Responded!")
    const recentWinner = await charityRaffle.getRecentWinner()
    const recentCharityWinner = await charityRaffle.getCharityWinner()
    console.log(`The player winner is: ${recentWinner}`)
    console.log(`The charity winner is: ${recentCharityWinner}`)
}

mockKeepers()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
