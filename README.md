# BFT Consensus Algorithm

This repository contains an implementation of a simplified **Byzantine Fault Tolerance (BFT)** consensus mechanism. It simulates validators reaching consensus on proposed blocks in a blockchain-like system, with a focus on state transitions, message broadcasting, and vote collection.

## Features

- **Consensus Phases**:
  - **Prepare**: Validators prepare votes for a proposed block.
  - **Pre-commit**: Validators confirm their intention to commit to the block.
  - **Commit**: Validators finalize the block.
- **Message Types**:
  - Proposal, Prepare, Pre-commit, Commit, and Round Change.
- **Quorum Validation**:
  - Ensures 2/3 + 1 quorum is met before advancing phases.
- **Dynamic Validators**:
  - The system supports custom validator sets with unique IDs and public keys.
- **Event-Driven Architecture**:
  - Events for broadcasting messages and block finalization.

## Prerequisites

- **Node.js**: Make sure you have Node.js (v14 or higher) installed.

## Getting Started

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/bft-consensus.git
   cd bft-consensus
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run to simulate the consensus process:
   ```bash
   npm start
   ```

## Example Output

The output will demonstrate:

- A block being proposed.
- Validators broadcasting and validating messages.
- State transitions between PREPARE, PRE-COMMIT, and COMMIT.
- The block being finalized upon reaching quorum.
