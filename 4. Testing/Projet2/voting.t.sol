// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Test, console} from "../lib/forge-std/src/Test.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../src/Voting.sol";

/*
 * @author Julien P.
 */
contract VotingTest is Test {
    Voting voting;
    address voter1 = makeAddr("voter1");
    address voter2 = makeAddr("voter2");
    address voter3 = makeAddr("voter3");
    address owner = address(this);

    string constant DEFAULT_PROPOSAL = "Proposal 1";
    uint constant DEFAULT_PROPOSAL_ID = 1;

    function setUp() public {
        voting = new Voting();
    }

    // *********** Get one proposal *********** //

    function test_getOneProposal() public {
        _setVotingInGivenStatus(Voting.WorkflowStatus.ProposalsRegistrationEnded);

        vm.prank(voter1);
        assertEq(keccak256(abi.encodePacked(voting.getOneProposal(DEFAULT_PROPOSAL_ID).description)),
            keccak256(abi.encodePacked(DEFAULT_PROPOSAL)));
    }

    function test_getOneProposalWithInvalidValue() public {
        _setVotingInGivenStatus(Voting.WorkflowStatus.ProposalsRegistrationEnded);
        
        vm.prank(voter1);
        vm.expectRevert();
        voting.getOneProposal(40);
    }

    function test_getOneProposalWithoutBeingVoter() public {
        vm.expectRevert("You're not a voter");
        voting.getOneProposal(1);
    }

    // *********** Get voter *********** //

    function test_getVoter() public {
        voting.addVoter(voter1);
        voting.addVoter(voter3);

        vm.startPrank(voter1);

        assertEq(voting.getVoter(voter1).isRegistered, true);
        assertEq(voting.getVoter(voter2).isRegistered, false);
        assertEq(voting.getVoter(voter3).isRegistered, true);

        vm.stopPrank();
    }

    function test_getVoterWithInvalidValue() public {
        _setVotingInGivenStatus(Voting.WorkflowStatus.ProposalsRegistrationEnded);

        vm.prank(voter1);
        assertEq(voting.getVoter(address(0)).isRegistered, false);
    }

    function test_getVoterWithoutBeingVoter() public {
        vm.expectRevert("You're not a voter");
        voting.getVoter(voter1);
    }

    // *********** Add voter *********** //

    function test_addVoter() public {
        voting.addVoter(owner);
        assertEq(voting.getVoter(owner).isRegistered, true);
    }

    function test_fuzz_addVoter(address fuzzedAddress) public {
        voting.addVoter(fuzzedAddress);

        // We use prank here because only voters can call 'getvoter()'
        vm.prank(fuzzedAddress);
        assertEq(voting.getVoter(fuzzedAddress).isRegistered, true);
    }

    function test_addAlreadyRegisteredVoter() public {
        voting.addVoter(voter1);

        vm.expectRevert("Already registered");
        voting.addVoter(voter1);
    }

    function test_addVoterInWrongStatus() public {
        _setVotingInGivenStatus(Voting.WorkflowStatus.ProposalsRegistrationStarted);

        vm.expectRevert("Voters registration is not open yet");
        voting.addVoter(voter2);
    }

    /*
     * @dev See comment on method "checkOnlyOwnerRevert()" for why I used
     * a try/catch
     */
    function test_addVoterWithoutBeingOwner() public {
        vm.prank(voter1);

        try voting.addVoter(voter2) {
            assertEq(true, false);
        } catch (bytes memory errorMessage) {
            assertEq(Ownable.OwnableUnauthorizedAccount.selector, bytes4(errorMessage));
        }
    }

    function test_addVoterEvent() public {
        vm.expectEmit();
        emit Voting.VoterRegistered(voter1);
        voting.addVoter(voter1);
    }

    // *********** Add proposal *********** //

    function test_addProposal() public {
        _setVotingInGivenStatus(Voting.WorkflowStatus.ProposalsRegistrationStarted);

        vm.startPrank(voter1);
        voting.addProposal("New proposal");

        assertEq(keccak256(abi.encodePacked("New proposal")), keccak256(abi.encodePacked(voting.getOneProposal(1).description)));
        vm.stopPrank();
    }

    function test_fuzz_addProposal(string calldata proposal) public {
        vm.assume(bytes(proposal).length > 0);

        _setVotingInGivenStatus(Voting.WorkflowStatus.ProposalsRegistrationStarted);

        vm.startPrank(voter1);
        voting.addProposal(proposal);

        assertEq(keccak256(abi.encodePacked(proposal)), keccak256(abi.encodePacked(voting.getOneProposal(1).description)));
        vm.stopPrank();
    }

    function test_addEmptyProposal() public {
        _setVotingInGivenStatus(Voting.WorkflowStatus.ProposalsRegistrationStarted);

        vm.prank(voter1);
        vm.expectRevert("Vous ne pouvez pas ne rien proposer");
        voting.addProposal("");
    }

    function test_addProposalInWrongWorkflowStatus() public {
        _setVotingInGivenStatus(Voting.WorkflowStatus.ProposalsRegistrationEnded);

        vm.prank(voter1);
        vm.expectRevert("Proposals are not allowed yet");
        voting.addProposal("New proposal");
    }

    function test_addProposalWithoutBeingVoter() public {
        vm.expectRevert("You're not a voter");
        voting.addProposal("New proposal");
    }

    function test_addProposalEvent() public {
        _setVotingInGivenStatus(Voting.WorkflowStatus.ProposalsRegistrationStarted);

        vm.prank(voter1);
        vm.expectEmit();
        emit Voting.ProposalRegistered(1);
        voting.addProposal("New proposal");
    }

    // *********** Add vote *********** //

    function test_setVote() public {
        _setVotingInGivenStatus(Voting.WorkflowStatus.VotingSessionStarted);

        vm.startPrank(voter1);
        voting.setVote(DEFAULT_PROPOSAL_ID);

        assertEq(voting.getVoter(voter1).hasVoted, true);
        assertEq(voting.getVoter(voter1).votedProposalId, DEFAULT_PROPOSAL_ID);
        vm.stopPrank();
    }

    function test_setVoteWithInvalidId() public {
        _setVotingInGivenStatus(Voting.WorkflowStatus.VotingSessionStarted);

        vm.startPrank(voter1);
        vm.expectRevert("Proposal not found");
        voting.setVote(42424242);
    }

    function test_setVoteInWrongWorkflowStatus() public {
        _setVotingInGivenStatus(Voting.WorkflowStatus.VotingSessionEnded);

        vm.prank(voter1);
        vm.expectRevert("Voting session havent started yet");
        voting.setVote(1);
    }

    function test_setVoteTwice() public {
        _setVotingInGivenStatus(Voting.WorkflowStatus.VotingSessionStarted);

        vm.startPrank(voter1);
        voting.setVote(DEFAULT_PROPOSAL_ID);

        vm.expectRevert("You have already voted");
        voting.setVote(DEFAULT_PROPOSAL_ID);

        vm.stopPrank();
    }

    function test_setVoteWithoutBeingVoter() public {
        vm.expectRevert("You're not a voter");
        voting.setVote(DEFAULT_PROPOSAL_ID);
    }

    function test_setVoteEvent() public {
        _setVotingInGivenStatus(Voting.WorkflowStatus.VotingSessionStarted);

        vm.prank(voter1);
        vm.expectEmit();
        emit Voting.Voted(voter1, DEFAULT_PROPOSAL_ID);
        voting.setVote(DEFAULT_PROPOSAL_ID);
    }

    // *********** Change workflow status *********** //
    // *********** Start proposal time *********** //

    function test_startProposalTime() public {
        voting.startProposalsRegistering();

        assertEq(uint(voting.workflowStatus()), uint(Voting.WorkflowStatus.ProposalsRegistrationStarted));
    }

    function test_startProposalTimeInWrongWorkflowStatus() public {
        _setVotingInGivenStatus(Voting.WorkflowStatus.ProposalsRegistrationEnded);

        vm.expectRevert("Registering proposals cant be started now");
        voting.startProposalsRegistering();
    }

    function test_startProposalTimeWithoutBeingOwner() public {
        vm.prank(voter1);

        _checkOnlyOwnerRevert(voting.startProposalsRegistering);
    }

    function test_startProposalTimeEvent() public {
        vm.expectEmit();
        emit Voting.WorkflowStatusChange(Voting.WorkflowStatus.RegisteringVoters, Voting.WorkflowStatus.ProposalsRegistrationStarted);
        voting.startProposalsRegistering();
    }

    // *********** End proposal time *********** //

    function test_endProposalTime() public {
        _setVotingInGivenStatus(Voting.WorkflowStatus.ProposalsRegistrationStarted);
        voting.endProposalsRegistering();

        assertEq(uint(voting.workflowStatus()), uint(Voting.WorkflowStatus.ProposalsRegistrationEnded));
    }

    function test_endProposalTimeInWrongWorkflowStatus() public {
        vm.expectRevert("Registering proposals havent started yet");
        voting.endProposalsRegistering();
    }

    function test_endProposalTimeWithoutBeingOwner() public {
        vm.prank(voter1);

        _checkOnlyOwnerRevert(voting.endProposalsRegistering);
    }

    function test_endProposalTimeEvent() public {
        _setVotingInGivenStatus(Voting.WorkflowStatus.ProposalsRegistrationStarted);

        vm.expectEmit();
        emit Voting.WorkflowStatusChange(Voting.WorkflowStatus.ProposalsRegistrationStarted, 
            Voting.WorkflowStatus.ProposalsRegistrationEnded);
        voting.endProposalsRegistering();
    }

    // *********** Start voting session *********** //

    function test_startVotingSession() public {
        _setVotingInGivenStatus(Voting.WorkflowStatus.ProposalsRegistrationEnded);
        voting.startVotingSession();

        assertEq(uint(voting.workflowStatus()), uint(Voting.WorkflowStatus.VotingSessionStarted));
    }

    function test_startVotingSessionInWrongWorkflowStatus() public {
        vm.expectRevert("Registering proposals phase is not finished");
        voting.startVotingSession();
    }

    function test_startVotingSessionWithoutBeingOwner() public {
        vm.prank(voter1);

        _checkOnlyOwnerRevert(voting.startVotingSession);
    }

    function test_startVotingSessionEvent() public {
        _setVotingInGivenStatus(Voting.WorkflowStatus.ProposalsRegistrationEnded);

        vm.expectEmit();
        emit Voting.WorkflowStatusChange(Voting.WorkflowStatus.ProposalsRegistrationEnded, Voting.WorkflowStatus.VotingSessionStarted);
        voting.startVotingSession();
    }

    // *********** End voting session *********** //

    function test_endVotingSession() public {
        _setVotingInGivenStatus(Voting.WorkflowStatus.VotingSessionStarted);
        voting.endVotingSession();

        assertEq(uint(voting.workflowStatus()), uint(Voting.WorkflowStatus.VotingSessionEnded));
    }

    function test_endVotingSessionInWrongWorkflowStatus() public {
        vm.expectRevert("Voting session havent started yet");
        voting.endVotingSession();
    }

    function test_endVotingSessionWithoutBeingOwner() public {
        vm.prank(voter1);

        _checkOnlyOwnerRevert(voting.endVotingSession);
    }

    function test_endVotingSessionEvent() public {
        _setVotingInGivenStatus(Voting.WorkflowStatus.VotingSessionStarted);
        vm.expectEmit();
        emit Voting.WorkflowStatusChange(Voting.WorkflowStatus.VotingSessionStarted, Voting.WorkflowStatus.VotingSessionEnded);
        voting.endVotingSession();
    }

    // *********** Tally *********** //

    function test_tallyVoteWithSingleProposal() public {
        _setVotingInGivenStatus(Voting.WorkflowStatus.VotesTallied);

        assertEq(voting.winningProposalID(), DEFAULT_PROPOSAL_ID);
    }

    function test_tallyVoteWithMultipleProposals() public {
        voting.addVoter(voter2);
        voting.addVoter(voter3);
        _setVotingToStartProposal();
        vm.prank(voter1);
        voting.addProposal("Proposal2");
        _setVotingFromStartProposalToEndProposal(); // Adds a default proposal with ID 2
        voting.startVotingSession();
        vm.prank(voter2);
        voting.setVote(2);
        vm.prank(voter3);
        voting.setVote(1);
        _setVotingFromStartVotingToEndVoting(); // Adds a default vote on proposal 1

        voting.tallyVotes();

        assertEq(voting.winningProposalID(), 1);
    }

    function test_tallyVoteWithTieVote() public {
        voting.addVoter(voter2);
        _setVotingToStartProposal();
        vm.prank(voter1);
        voting.addProposal("Proposal2");
        _setVotingFromStartProposalToEndProposal(); // Adds a default proposal with ID 2
        voting.startVotingSession();
        vm.prank(voter2);
        voting.setVote(2);
        _setVotingFromStartVotingToEndVoting(); // Adds a default vote on proposal 1

        voting.tallyVotes();

        assertEq(voting.winningProposalID(), 1);
    }

    function test_tallyVoteWithoutVotes() public {
        _setVotingToStartProposal();
        _setVotingFromStartProposalToEndProposal();
        voting.startVotingSession();
        voting.endVotingSession();

        voting.tallyVotes();

        assertEq(voting.winningProposalID(), 0);
    }

    function test_tallyVotesWithoutBeingOwner() public {
        vm.prank(voter1);

        _checkOnlyOwnerRevert(voting.tallyVotes);
    }

    function test_tallyVotesInWrongWorkflowStatus() public {
        vm.expectRevert("Current status is not voting session ended");
        voting.tallyVotes();
    }

    function test_tallyVotesEvent() public {
        _setVotingInGivenStatus(Voting.WorkflowStatus.VotingSessionEnded);

        vm.expectEmit();
        emit Voting.WorkflowStatusChange(Voting.WorkflowStatus.VotingSessionEnded, Voting.WorkflowStatus.VotesTallied);
        voting.tallyVotes();
    }

    // *********** Helpers *********** //

    /*
     * @dev Expect revert of the given function
     * We expect the test to use the default voter as user for test : voter1
     * Using abi.encoreWithSelector allows me to not use the encoded string method (with bytes & keccak), and use directly the selector.
     */
    function _checkOnlyOwnerRevert(function() external f) internal {
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, voter1));
        f();
    }

    /*
     * @dev 
     *  Helper method to put Voting in right state for testing purpose.
     *  I chose to compare WorkflowStatus index, as it allows me to simplify the code.
     *  For each workflow step, you must have done all the steps before. So instead of using a if / else if structure,
     *  I can use here a if (value >= ), because higher step means that it will also validate all previous if
     */
    function _setVotingInGivenStatus(Voting.WorkflowStatus ws) internal {
        if (uint(ws) >= uint(Voting.WorkflowStatus.ProposalsRegistrationStarted)) {
            _setVotingToStartProposal();
        }
        if (uint(ws) >= uint(Voting.WorkflowStatus.ProposalsRegistrationEnded)) {
            _setVotingFromStartProposalToEndProposal();
        } 
        if (uint(ws) >= uint(Voting.WorkflowStatus.VotingSessionStarted)) {
            voting.startVotingSession();
        } 
        if (uint(ws) >= uint(Voting.WorkflowStatus.VotingSessionEnded)) {
            _setVotingFromStartVotingToEndVoting();
        } 
        if (uint(ws) >= uint(Voting.WorkflowStatus.VotesTallied)) {
            voting.tallyVotes();
        }
    }

    function _setVotingToStartProposal() internal {
        voting.addVoter(voter1);
        voting.startProposalsRegistering();
    }

    function _setVotingFromStartProposalToEndProposal() internal {
        vm.prank(voter1);
        voting.addProposal(DEFAULT_PROPOSAL);
        voting.endProposalsRegistering();
    }

    function _setVotingFromStartVotingToEndVoting() internal {
        vm.prank(voter1);
        voting.setVote(DEFAULT_PROPOSAL_ID);
        voting.endVotingSession();
    }
}