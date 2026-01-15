# Lottery Roadmap

## 🚀 Future Enhancements

### 1. Advanced Raffle Mechanics
- **Multi-Raffle Support**: Enable the factory pattern to deploy and manage multiple raffles with different intervals and fees simultaneously.
- **Tiered Ticket System**: Allow users to purchase multiple "tickets" per address to increase winning probabilities.
- **Weighted Participation**: Integrate governance tokens to weight raffle entries based on token holdings.

### 2. Governance & Community
- **DAO Charity Selection**: Implement a voting mechanism for token holders to propose and select the charities for `CharityRaffle.sol`.
- **Match Funding Pools**: Allow community members to contribute to the donation match pool, not just the designated funder.

### 3. Cross-Chain & Infrastructure
- **L2 Deployments**: Optimize contracts for deployment on Base, Arbitrum, and Polygon to reduce gas costs for participants.
- **Chainlink VRF v2.5**: Upgrade to the latest Chainlink VRF version for improved gas payment options and developer experience.

## 🔗 Mutual Integration with Skyron

### 1. Skyron-Lottery Bridge
- **Skyron Credit Entries**: Allow users to "burn" credits in the Skyron blockchain to receive a raffle ticket on the EVM chain via an oracular proof.
- **Cross-Chain State Oracles**: Use a specialized Skyron node to act as a data provider for the Lottery contract, potentially triggering specific raffle conditions based on Skyron's chain height or volume.

### 2. Unified Dashboard
- **Postilize Portal**: Develop a front-end that displays both the Skyron blockchain explorer data and the various active/past raffles in one view.
