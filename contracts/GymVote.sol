// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract GymVote is ReentrancyGuard {
    struct Voter {
        uint256 weight;
        bool voted;
        uint256 vote;
        bool hasClaimedRefund;
    }

    struct Proposal {
        bytes32 name;
        uint256 voteCount; 
    }

    address public immutable chairperson;
    IERC20 public immutable usdcToken;
    uint256 public constant VOTE_COST = 10 * 10**6; // 10 USDC (6 decimals)
    uint256 public constant REFUND_AMOUNT = 2 * 10**6; // 2 USDC
    bool public votingEnded;
    uint256 public winningProposalId;

    mapping(address => Voter) public voters;
    Proposal[] public proposals;

    event VoteCast(address indexed voter, uint256 proposalId);
    event RefundClaimed(address indexed voter, uint256 amount);
    event VotingEnded(uint256 winningProposalId, bytes32 winningProposalName);

    error VotingHasEnded();
    error AlreadyVoted();
    error InvalidProposal();
    error NotChairperson();
    error VotingNotEnded();
    error NoVoteRecorded();
    error RefundAlreadyClaimed();
    error WinnersCannotClaimRefund();
    error TransferFailed();

    constructor(bytes32[] memory proposalNames, address _usdcToken) {
        require(proposalNames.length == 2, "Must have exactly 2 proposals");
        require(_usdcToken != address(0), "Invalid USDC address");
        
        chairperson = msg.sender;
        voters[chairperson].weight = 1;
        usdcToken = IERC20(_usdcToken);

        for (uint i = 0; i < proposalNames.length; i++) {
            require(proposalNames[i] != bytes32(0), "Empty proposal name");
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }

    function vote(uint256 proposal) external nonReentrant {
        if (votingEnded) revert VotingHasEnded();
        if (voters[msg.sender].voted) revert AlreadyVoted();
        if (proposal >= proposals.length) revert InvalidProposal();
        
        bool success = usdcToken.transferFrom(msg.sender, address(this), VOTE_COST);
        if (!success) revert TransferFailed();

        Voter storage sender = voters[msg.sender];
        sender.voted = true;
        sender.vote = proposal;
        sender.weight = 1;
        proposals[proposal].voteCount += 1;
        
        emit VoteCast(msg.sender, proposal);
    }

    function endVoting() external {
        if (msg.sender != chairperson) revert NotChairperson();
        if (votingEnded) revert VotingHasEnded();
        
        winningProposalId = winningProposal();
        votingEnded = true;
        
        emit VotingEnded(winningProposalId, proposals[winningProposalId].name);
    }

    function claimRefund() external nonReentrant {
        if (!votingEnded) revert VotingNotEnded();
        
        Voter storage voter = voters[msg.sender];
        if (!voter.voted) revert NoVoteRecorded();
        if (voter.hasClaimedRefund) revert RefundAlreadyClaimed();
        if (voter.vote == winningProposalId) revert WinnersCannotClaimRefund();

        voter.hasClaimedRefund = true;
        bool success = usdcToken.transfer(msg.sender, REFUND_AMOUNT);
        if (!success) revert TransferFailed();
                
        emit RefundClaimed(msg.sender, REFUND_AMOUNT);
    }

    function winningProposal() public view returns (uint256 winningProposal_) {
        uint256 winningVoteCount = 0;
        for (uint256 p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    function getProposalCount() external view returns (uint256) {
        return proposals.length;
    }

    function getProposalName(uint256 index) external view returns (bytes32) {
        return proposals[index].name;
    }

    function getProposalVotes(uint256 index) external view returns (uint256) {
        return proposals[index].voteCount;
    }
}