const { expect } = require("chai");
const hre = require("hardhat");
const { PANIC_CODES } = require("@nomicfoundation/hardhat-chai-matchers/panic");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Voting contract", function () {
  const DEFAULT_PROPOSAL = "Proposal 1";
  const DEFAULT_PROPOSAL_ID = 1;
  let owner, voter1, voter2, voter3;
  let voting;

  before(async function () {
    // We can get our addresses only once, and reuse them for each test
    [owner, voter1, voter2, voter3] = await ethers.getSigners();
  });

  beforeEach(async function () {
    // Must reset voting instance before each test
    voting = await ethers.deployContract("Voting");
  });

  const WorkflowStatus = {
    RegisteringVoters: 0,
    ProposalsRegistrationStarted: 1,
    ProposalsRegistrationEnded: 2,
    VotingSessionStarted: 3,
    VotingSessionEnded: 4,
    VotesTallied: 5,
  };

  /**
   * I use a method to set voting in the right state here, a fixture wouldn't make sense as I don't make any change on blockchain state
   */
  async function _setVotingInGivenStatus(ws) {
    if (ws >= WorkflowStatus.ProposalsRegistrationStarted) {
      await _setVotingToStartProposal();
    }
    if (ws >= WorkflowStatus.ProposalsRegistrationEnded) {
      await _setVotingFromStartProposalToEndProposal();
    }
    if (ws >= WorkflowStatus.VotingSessionStarted) {
      await voting.startVotingSession();
    }
    if (ws >= WorkflowStatus.VotingSessionEnded) {
      await _setVotingFromStartVotingToEndVoting();
    }
    if (ws >= WorkflowStatus.VotesTallied) {
      await voting.tallyVotes();
    }
  }

  async function _setVotingToStartProposal() {
    await voting.addVoter(voter1);
    await voting.startProposalsRegistering();
  }

  async function _setVotingFromStartProposalToEndProposal() {
    await voting.connect(voter1).addProposal(DEFAULT_PROPOSAL);
    await voting.endProposalsRegistering();
  }

  async function _setVotingFromStartVotingToEndVoting() {
    await voting.connect(voter1).setVote(DEFAULT_PROPOSAL_ID);
    await voting.endVotingSession();
  }

  // *********** Get one proposal *********** //
  describe("getOneProposal(uint proposalId)", function () {
    beforeEach(async function () {
      await _setVotingInGivenStatus(WorkflowStatus.ProposalsRegistrationEnded);
    });

    it("Should get an existing proposal", async function () {
      expect((await voting.connect(voter1).getOneProposal(DEFAULT_PROPOSAL_ID)).description).to.equal(DEFAULT_PROPOSAL);
    });

    it("Should fail trying to get a non existing proposal", async function () {
      await expect(voting.connect(voter1).getOneProposal(424242)).to.be.revertedWithPanic(PANIC_CODES.ARRAY_ACCESS_OUT_OF_BOUNDS);
    });

    it("Should fail trying to get a proposal without being a voter", async function () {
      await expect(voting.getOneProposal(1)).to.be.rejectedWith("You're not a voter");
    });
  });

  // *********** Get one voter *********** //
  describe("getVoter(address voterAddress)", function () {
    it("Should get existing voters", async function () {
      await voting.addVoter(voter1);
      await voting.addVoter(voter3);

      expect((await voting.connect(voter1).getVoter(voter1)).isRegistered).to.equal(true);
      expect((await voting.connect(voter1).getVoter(voter2)).isRegistered).to.equal(false);
      expect((await voting.connect(voter1).getVoter(voter3)).isRegistered).to.equal(true);
    });

    it("Should fail trying to get a voter without being a voter", async function () {
      await expect(voting.getVoter(voter1)).to.be.revertedWith("You're not a voter");
    });
  });

  // *********** Add voter *********** //

  describe("addVoter(address voterAddress)", function () {
    it("Should add a voter", async function () {
      await voting.addVoter(owner);
      expect((await voting.getVoter(owner)).isRegistered).to.equal(true);
    });

    it("Should fail trying to add an already registered voter", async function () {
      await voting.addVoter(voter1);

      await expect(voting.addVoter(voter1)).to.be.revertedWith("Already registered");
    });

    it("Should fail trying to add a voter in the wrong wworkflow status", async function () {
      await _setVotingInGivenStatus(WorkflowStatus.ProposalsRegistrationStarted);

      await expect(voting.addVoter(voter2)).to.be.revertedWith("Voters registration is not open yet");
    });

    it("Should fail trying to add a voter without being the owner", async function () {
      await expect(voting.connect(voter1).addVoter(voter2))
        .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
        .withArgs(voter1);
    });

    it("Should emit an event when adding a voter", async function () {
      await expect(voting.addVoter(voter1)).to.emit(voting, "VoterRegistered").withArgs(voter1);
    });
  });

  // *********** Add proposal *********** //
  describe("addProposal(string proposalDescription)", function () {
    beforeEach(async function () {
      await _setVotingInGivenStatus(WorkflowStatus.ProposalsRegistrationStarted);
    });

    it("Should add a proposal", async function () {
      await voting.connect(voter1).addProposal("New proposal");
      expect((await voting.connect(voter1).getOneProposal(1)).description).to.equal("New proposal");
    });

    it("Should fail trying to add an empty proposal", async function () {
      await expect(voting.connect(voter1).addProposal("")).to.be.revertedWith("Vous ne pouvez pas ne rien proposer");
    });

    it("Should fail trying to add a proposal in the wrong workflow status", async function () {
      await voting.endProposalsRegistering();
      await expect(voting.connect(voter1).addProposal("New proposal")).to.be.revertedWith("Proposals are not allowed yet");
    });

    it("Should fail trying to add a proposal without being voter", async function () {
      await expect(voting.addProposal("New proposal")).to.be.revertedWith("You're not a voter");
    });

    it("Should emit an event when adding a proposal", async function () {
      await expect(voting.connect(voter1).addProposal("New proposal")).to.emit(voting, "ProposalRegistered").withArgs(1);
    });
  });

  // *********** Add vote *********** //
  describe("setVote(uint proposalId)", function () {
    beforeEach(async function () {
      await _setVotingInGivenStatus(WorkflowStatus.VotingSessionStarted);
    });

    it("Should add a vote", async function () {
      await voting.connect(voter1).setVote(DEFAULT_PROPOSAL_ID);

      expect((await voting.connect(voter1).getVoter(voter1)).hasVoted).to.equal(true);
      expect((await voting.connect(voter1).getVoter(voter1)).votedProposalId).to.equal(DEFAULT_PROPOSAL_ID);
    });

    it("Should fail trying to vote for a non existing proposal", async function () {
      await expect(voting.connect(voter1).setVote(42424242)).to.be.revertedWith("Proposal not found");
    });

    it("Should fail trying to vote in a wrong workflow status", async function () {
      await voting.endVotingSession();
      await expect(voting.connect(voter1).setVote(DEFAULT_PROPOSAL_ID)).to.be.revertedWith("Voting session havent started yet");
    });

    it("Should fail trying to vote twice", async function () {
      await voting.connect(voter1).setVote(DEFAULT_PROPOSAL_ID);

      await expect(voting.connect(voter1).setVote(DEFAULT_PROPOSAL_ID)).to.be.revertedWith("You have already voted");
    });

    it("Should fail trying to vote without being a voter", async function () {
      await expect(voting.setVote(DEFAULT_PROPOSAL_ID)).to.be.revertedWith("You're not a voter");
    });

    it("Should emit an event when voting", async function () {
      await expect(voting.connect(voter1).setVote(DEFAULT_PROPOSAL_ID)).to.emit(voting, "Voted").withArgs(voter1, DEFAULT_PROPOSAL_ID);
    });
  });

  // *********** Change workflow status *********** //
  // *********** Start proposal time *********** //
  describe("startProposalRegistering()", function () {
    it("Should start proposal time", async function () {
      await voting.startProposalsRegistering();

      expect(await voting.workflowStatus()).to.equal(WorkflowStatus.ProposalsRegistrationStarted);
    });

    it("Should fail trying to start proposal time in wrong workflow status", async function () {
      await _setVotingInGivenStatus(WorkflowStatus.ProposalsRegistrationEnded);

      await expect(voting.startProposalsRegistering()).to.be.revertedWith("Registering proposals cant be started now");
    });

    it("Should fail trying to start proposal time without being owner", async function () {
      await expect(voting.connect(voter1).startProposalsRegistering())
        .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
        .withArgs(voter1);
    });

    it("Should emit an event when starting proposal time", async function () {
      await expect(voting.startProposalsRegistering())
        .to.emit(voting, "WorkflowStatusChange")
        .withArgs(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    });
  });

  // *********** End proposal time *********** //
  describe("endProposalRegistering()", function () {
    beforeEach(async function () {
      await _setVotingInGivenStatus(WorkflowStatus.ProposalsRegistrationStarted);
    });

    it("Should end proposal time", async function () {
      await voting.endProposalsRegistering();
      expect(await voting.workflowStatus()).to.equal(WorkflowStatus.ProposalsRegistrationEnded);
    });

    it("Should fail trying to end proposal time in wrong workflow status", async function () {
      await voting.endProposalsRegistering(); // Calling it twice to be in wrong current status on 2nd try
      await expect(voting.endProposalsRegistering()).to.be.revertedWith("Registering proposals havent started yet");
    });

    it("Should fail trying to end proposal time without being owner", async function () {
      await expect(voting.connect(voter1).endProposalsRegistering())
        .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
        .withArgs(voter1);
    });

    it("Should emit an event when ending proposal time", async function () {
      await expect(voting.endProposalsRegistering())
        .to.emit(voting, "WorkflowStatusChange")
        .withArgs(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    });
  });

  // *********** Start voting session *********** //
  describe("startVotingSession()", function () {
    beforeEach(async function () {
      await _setVotingInGivenStatus(WorkflowStatus.ProposalsRegistrationEnded);
    });

    it("Should start voting session", async function () {
      await voting.startVotingSession();
      expect(await voting.workflowStatus()).to.equal(WorkflowStatus.VotingSessionStarted);
    });

    it("Should fail trying to start voting session in wrong workflow status", async function () {
      await voting.startVotingSession(); // Calling it twice to be in wrong current status on 2nd try
      await expect(voting.startVotingSession()).to.be.revertedWith("Registering proposals phase is not finished");
    });

    it("Should fail trying to start voting session without being owner", async function () {
      await expect(voting.connect(voter1).startVotingSession())
        .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
        .withArgs(voter1);
    });

    it("Should emit an event when starting voting session", async function () {
      await expect(voting.startVotingSession())
        .to.emit(voting, "WorkflowStatusChange")
        .withArgs(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    });
  });

  // *********** End voting session *********** //
  describe("endVotingSession()", function () {
    beforeEach(async function () {
      await _setVotingInGivenStatus(WorkflowStatus.VotingSessionStarted);
    });

    it("Should end voting session", async function () {
      await voting.endVotingSession();
      expect(await voting.workflowStatus()).to.equal(WorkflowStatus.VotingSessionEnded);
    });

    it("Should fail trying to end voting session in wrong workflow status", async function () {
      await voting.endVotingSession(); // Calling it twice to be in wrong current status on 2nd try
      await expect(voting.endVotingSession()).to.be.revertedWith("Voting session havent started yet");
    });

    it("Shoud fail trying to end voting session without being owner", async function () {
      await expect(voting.connect(voter1).endVotingSession())
        .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
        .withArgs(voter1);
    });

    it("Should emit an event when ending voting session", async function () {
      await expect(voting.endVotingSession())
        .to.emit(voting, "WorkflowStatusChange")
        .withArgs(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    });
  });

  // *********** Tally *********** //
  describe("tallyVotes()", function () {
    // I don't use beforeEach() here as most of my tests needs to set status manually
    it("Should tally voters (with only 1 proposal)", async function () {
      await _setVotingInGivenStatus(WorkflowStatus.VotesTallied);

      expect(await voting.winningProposalID()).to.equal(DEFAULT_PROPOSAL_ID);
    });

    it("Should tally vote (with multiple proposals)", async function () {
      await voting.addVoter(voter2);
      await voting.addVoter(voter3);
      await _setVotingToStartProposal();
      await voting.connect(voter1).addProposal("Proposal2");
      await _setVotingFromStartProposalToEndProposal(); // It adds a default proposal which will here get the id 2
      await voting.startVotingSession();
      await voting.connect(voter2).setVote(2);
      await voting.connect(voter3).setVote(1);
      await _setVotingFromStartVotingToEndVoting(); // Adds a default vote on proposal 1

      await voting.tallyVotes();

      expect(await voting.winningProposalID()).to.equal(1);
    });

    it("Should tally vote (with tie vote)", async function () {
      await voting.addVoter(voter2);
      await _setVotingToStartProposal();
      await voting.connect(voter1).addProposal("Proposal2");
      await _setVotingFromStartProposalToEndProposal(); // It adds a default proposal which will here get the id 2
      await voting.startVotingSession();
      await voting.connect(voter2).setVote(2);
      await _setVotingFromStartVotingToEndVoting(); // Adds a default vote on proposal 1

      await voting.tallyVotes();

      expect(await voting.winningProposalID()).to.equal(1);
    });

    it("Should tally votes (without any votes)", async function () {
      await _setVotingToStartProposal();
      await _setVotingFromStartProposalToEndProposal();
      await voting.startVotingSession();
      await voting.endVotingSession();

      await voting.tallyVotes();

      expect(await voting.winningProposalID()).to.equal(0);
    });

    it("Should fail trying to tally votes without being owner", async function () {
      await expect(voting.connect(voter1).tallyVotes())
        .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
        .withArgs(voter1);
    });

    it("Should fail trying to tally votes in wrong workflow status", async function () {
      await expect(voting.tallyVotes()).to.be.revertedWith("Current status is not voting session ended");
    });

    it("Should emit an event when tallying votes", async function () {
      await _setVotingInGivenStatus(WorkflowStatus.VotingSessionEnded);

      await expect(voting.tallyVotes())
        .to.emit(voting, "WorkflowStatusChange")
        .withArgs(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    });
  });
});
