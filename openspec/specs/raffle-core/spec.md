# raffle-core Specification

## Purpose
TBD - created by archiving change wire-lottery-baseline. Update Purpose after archive.
## Requirements
### Requirement: Raffle Participation
Users SHALL be able to enter a raffle by paying a fixed entrance fee while the raffle is in the OPEN state.

#### Scenario: Successful entry
- **WHEN** a user calls `enterRaffle` with ETH >= entrance fee and state is OPEN
- **THEN** they are added to the list of players

### Requirement: Winner Selection Lifecycle
The system SHALL use Chainlink Keepers to monitor when a raffle is ready to be resolved and Chainlink VRF to select a verifiable random winner.

#### Scenario: Upkeep needed
- **WHEN** the interval has passed, there are players, and the contract has a balance
- **THEN** `checkUpkeep` returns true

#### Scenario: Verified randomness
- **WHEN** `fulfillRandomWords` is called by the VRF Coordinator
- **THEN** a winner is picked from the players list and paid the full contract balance

