import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"

import {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} from "../../helper-hardhat-config"
import verify from "../../utils/verify"

const FUND_AMOUNT = "1000000000000000000000"

const deployCharityRaffle: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network, ethers } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId
    const jackpot = networkConfig[network.config.chainId!]["jackpot"]
    let vrfCoordinatorV2Address, subscriptionId, charity1, charity2, charity3

    if (chainId == 31337) {
        // accounts[0] = deployer, accounts[1] = player1, accounts[2] = player2
        const accounts = await ethers.getSigners()
        charity1 = accounts[3].address
        charity2 = accounts[4].address
        charity3 = accounts[5].address
        // create VRFV2 Subscription
        const vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock", (await deployments.get("VRFCoordinatorV2Mock")).address)
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.target
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
        const transactionReceipt = await transactionResponse.wait()
        subscriptionId = transactionReceipt.logs[0].args.subId
        // Fund the subscription
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[network.config.chainId!]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[network.config.chainId!]["subscriptionId"]
        charity1 = networkConfig[network.config.chainId!]["charity1"]
        charity2 = networkConfig[network.config.chainId!]["charity2"]
        charity3 = networkConfig[network.config.chainId!]["charity3"]
    }
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    log("----------------------------------------------------")
    const args: any[] = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[network.config.chainId!]["gasLane"],
        networkConfig[network.config.chainId!]["raffleEntranceFee"],
        jackpot,
        networkConfig[network.config.chainId!]["charityRaffleDuration"],
        networkConfig[network.config.chainId!]["callbackGasLimit"],
        charity1,
        charity2,
        charity3,
        deployer,
    ]
    const charityRaffle = await deploy("CharityRaffle", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: waitBlockConfirmations,
        value: jackpot,
    })

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock", vrfCoordinatorV2Address)
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, charityRaffle.address)
    }

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(charityRaffle.address, args)
    }

    log("Interact with Charity Raffle contract with command:")
    const networkName = network.name == "hardhat" ? "localhost" : network.name
    log(
        `yarn hardhat run scripts/charity-raffle-scripts/enterCharityRaffle.js --network ${networkName}`
    )
    log("----------------------------------------------------")
}
export default deployCharityRaffle
deployCharityRaffle.tags = ["all", "charity-raffle"]
