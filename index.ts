import { EventEmitter } from "events";

// Enum for consensus states
enum ConsensusState {
  IDLE,
  PREPARE,
  PRE_COMMIT,
  COMMIT,
  FINISHED,
}

// Enum for message types
enum MessageType {
  PROPOSAL,
  PREPARE,
  PRE_COMMIT,
  COMMIT,
  ROUND_CHANGE,
}

// Core interfaces
interface Validator {
  id: string;
  publicKey: string;
}

interface Block {
  height: number;
  transactions: any[];
  timestamp: number;
  proposer: string;
}

interface ConsensusMessage {
  type: MessageType;
  blockHeight: number;
  blockHash: string;
  sender: string;
  signature: string;
  data?: any;
}

class BFTConsensus extends EventEmitter {
  private state: ConsensusState = ConsensusState.IDLE;
  private validators: Map<string, Validator>;
  private currentBlock: Block | null = null;
  private currentRound: number = 0;

  // Consensus tracking
  private prepareVotes: Set<string> = new Set();
  private preCommitVotes: Set<string> = new Set();
  private commitVotes: Set<string> = new Set();

  constructor(validators: Validator[]) {
    super();
    this.validators = new Map(validators.map((v) => [v.id, v]));
  }

  // Core consensus methods
  public startConsensus(block: Block) {
    console.log("Starting consensus with block:", block);
    if (this.state !== ConsensusState.IDLE) {
      throw new Error("Consensus already in progress");
    }

    this.currentBlock = block;
    this.currentRound++;
    this.state = ConsensusState.PREPARE;
    console.log(
      "Consensus state updated to PREPARE. Current round:",
      this.currentRound
    );

    // Broadcast proposal
    const message = {
      type: MessageType.PROPOSAL,
      blockHeight: block.height,
      blockHash: this.calculateBlockHash(block),
      sender: block.proposer,
      signature: this.signMessage(block),
    };
    console.log("Broadcasting proposal message:", message);
    this.broadcastMessage(message);
  }

  public receiveMessage(message: ConsensusMessage) {
    console.log("Received message:", message);

    // Validate message
    if (!this.validateMessage(message)) {
      console.warn("Invalid message received. Skipping...");
      return;
    }

    console.log("Message validated successfully:", message);

    switch (message.type) {
      case MessageType.PROPOSAL:
        console.log("Handling proposal message");
        this.handleProposal(message);
        break;
      case MessageType.PREPARE:
        console.log("Handling prepare message");
        this.handlePrepare(message);
        break;
      case MessageType.PRE_COMMIT:
        console.log("Handling pre-commit message");
        this.handlePreCommit(message);
        break;
      case MessageType.COMMIT:
        console.log("Handling commit message");
        this.handleCommit(message);
        break;
      case MessageType.ROUND_CHANGE:
        console.log("Handling round change message");
        this.handleRoundChange(message);
        break;
      default:
        console.warn("Unknown message type:", message.type);
    }
  }

  private handleProposal(message: ConsensusMessage) {
    console.log("Processing proposal in state:", this.state);
    if (this.state !== ConsensusState.PREPARE) return;

    this.prepareVotes.add(message.sender);
    console.log("Prepare votes:", this.prepareVotes);

    // If enough prepare votes, move to pre-commit
    if (this.hasQuorumVotes(this.prepareVotes)) {
      console.log(
        "Quorum reached in prepare phase. Broadcasting pre-commit message."
      );
      this.state = ConsensusState.PRE_COMMIT;

      this.broadcastMessage({
        type: MessageType.PRE_COMMIT,
        blockHeight: message.blockHeight,
        blockHash: message.blockHash,
        sender: this.getSelfId(),
        signature: this.signMessage(message),
      });
      console.log("Consensus state updated to PRE_COMMIT.");
    }
  }

  private handlePrepare(message: ConsensusMessage) {
    console.log("Processing prepare message in state:", this.state);
    this.prepareVotes.add(message.sender);
    console.log("Updated prepare votes:", this.prepareVotes);
  }

  private handlePreCommit(message: ConsensusMessage) {
    console.log("Processing pre-commit message in state:", this.state);
    if (this.state !== ConsensusState.PRE_COMMIT) return;

    this.preCommitVotes.add(message.sender);
    console.log("Pre-commit votes:", this.preCommitVotes);

    if (this.hasQuorumVotes(this.preCommitVotes)) {
      console.log(
        "Quorum reached in pre-commit phase. Broadcasting commit message."
      );
      this.state = ConsensusState.COMMIT;

      this.broadcastMessage({
        type: MessageType.COMMIT,
        blockHeight: message.blockHeight,
        blockHash: message.blockHash,
        sender: this.getSelfId(),
        signature: this.signMessage(message),
      });
      console.log("Consensus state updated to COMMIT.");
    }
  }

  private handleCommit(message: ConsensusMessage) {
    console.log("Processing commit message in state:", this.state);
    if (this.state !== ConsensusState.COMMIT) return;

    this.commitVotes.add(message.sender);
    console.log("Commit votes:", this.commitVotes);

    if (this.hasQuorumVotes(this.commitVotes)) {
      console.log("Quorum reached in commit phase. Finalizing block.");
      this.finalizeBlock();
    }
  }

  private handleRoundChange(message: ConsensusMessage) {
    // Logic for changing rounds if consensus fails
    this.resetConsensusState();
  }

  // Utility methods (placeholders in a real implementation)
  private calculateBlockHash(block: Block): string {
    return JSON.stringify(block); // Simplified hash
  }

  private signMessage(data: any): string {
    return "signature_placeholder";
  }

  private validateMessage(message: ConsensusMessage): boolean {
    // Check sender is a valid validator
    return this.validators.has(message.sender);
  }

  private hasQuorumVotes(voteSet: Set<string>): boolean {
    // 2/3 + 1 quorum
    const quorumThreshold = Math.floor((this.validators.size * 2) / 3) + 1;
    return voteSet.size >= quorumThreshold;
  }

  private getSelfId(): string {
    // In a real implementation, would return the current validator's ID
    return "self_validator";
  }

  private broadcastMessage(message: ConsensusMessage) {
    console.log("Broadcasting message to validators:", message);
    this.emit("broadcast", message);
  }

  private finalizeBlock() {
    console.log("Finalizing block:", this.currentBlock);
    this.emit("block_finalized", this.currentBlock);
    this.resetConsensusState();
  }

  private resetConsensusState() {
    console.log("Resetting consensus state.");
    this.state = ConsensusState.IDLE;
    this.prepareVotes.clear();
    this.preCommitVotes.clear();
    this.commitVotes.clear();
    this.currentBlock = null;
  }
}

// Example Usage
function runConsensusExample() {
  // Create validators
  const validators: Validator[] = [
    { id: "validator1", publicKey: "key1" },
    { id: "validator2", publicKey: "key2" },
    { id: "validator3", publicKey: "key3" },
    { id: "validator4", publicKey: "key4" },
  ];

  // Create consensus instance
  const consensus = new BFTConsensus(validators);

  // Listen for block finalization
  consensus.on("block_finalized", (block) => {
    console.log("Block finalized:", block);
  });

  // Listen for broadcast messages
  consensus.on("broadcast", (message) => {
    // Simulate message propagation to other validators
    validators.forEach((validator) => {
      if (validator.id !== message.sender) {
        consensus.receiveMessage({
          ...message,
          sender: validator.id,
        });
      }
    });
  });

  // Propose a new block
  const proposedBlock: Block = {
    height: 1,
    transactions: [
      { from: "alice", to: "bob", amount: 100 },
      { from: "bob", to: "charlie", amount: 50 },
    ],
    timestamp: Date.now(),
    proposer: "validator1",
  };

  // Start consensus
  consensus.startConsensus(proposedBlock);
}

// Run the example
runConsensusExample();

export { BFTConsensus, ConsensusState, MessageType };
