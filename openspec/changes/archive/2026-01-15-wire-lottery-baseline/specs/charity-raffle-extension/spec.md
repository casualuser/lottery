## ADDED Requirements

### Requirement: Charity Donations
Users SHALL enter the charity raffle by donating to one of the three supported charities.

#### Scenario: Entry with charity choice
- **WHEN** a user calls `enterRaffle` with a `CharityChoice` and the entrance fee
- **THEN** the donation is forwarded to the selected charity and the player is registered

### Requirement: Charity Winner and Tie Breaking
The system SHALL identify the charity with the most donations and break ties using additional random words from Chainlink VRF.

#### Scenario: Charity winner declared
- **WHEN** the raffle closes and one charity has the most donations
- **THEN** that charity is declared the winner

### Requirement: Donation Matching
A designated funder SHALL be able to match the total donations received by the winning charity after the raffle is closed.

#### Scenario: Successful matching
- **WHEN** the funder calls `fundDonationMatch` with the required amount and then `donationMatch`
- **THEN** the matched funds are sent to the winning charity
