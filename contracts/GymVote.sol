// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract GymVote {
    struct Voter {
        uint weight;
        bool voted;
        address delegate;
        uint vote;
        bool hasClaimedRefund;
    }

    struct Proposal {
        bytes32 name;
        uint voteCount; 
    }

    address public chairperson;
    IERC20 public usdcToken;
    uint256 public constant VOTE_COST = 10 * 10**6; // 10 USDC (6 decimals)
    uint256 public constant REFUND_AMOUNT = 2 * 10**6; // 2 USDC
    bool public votingEnded;
    uint public winningProposalId;

    mapping(address => Voter) public voters;
    Proposal[] public proposals;

    event VoteCast(address indexed voter, uint proposalId);
    event RefundClaimed(address indexed voter, uint256 amount);
    event VotingEnded(uint winningProposalId);

    constructor(bytes32[] memory proposalNames, address _usdcToken) {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;
        usdcToken = IERC20(_usdcToken);

        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }

    function giveRightToVote(address voter) external {
        require(msg.sender == chairperson, "Only chairperson can give right to vote.");
        require(!voters[voter].voted, "The voter already voted.");
        require(voters[voter].weight == 0);
        voters[voter].weight = 1;
    }

    function vote(uint proposal) external {
        require(!votingEnded, "Voting has ended");
        Voter storage sender = voters[msg.sender];
        require(sender.weight != 0, "Has no right to vote");
        require(!sender.voted, "Already voted.");
        
        // Transfer USDC from voter to contract
        require(usdcToken.transferFrom(msg.sender, address(this), VOTE_COST), 
                "USDC transfer failed");

        sender.voted = true;
        sender.vote = proposal;
        proposals[proposal].voteCount += sender.weight;
        
        emit VoteCast(msg.sender, proposal);
    }

    function endVoting() external {
        require(msg.sender == chairperson, "Only chairperson can end voting");
        require(!votingEnded, "Voting already ended");
        
        winningProposalId = winningProposal();
        votingEnded = true;
        
        emit VotingEnded(winningProposalId);
    }

    function claimRefund() external {
        require(votingEnded, "Voting has not ended yet");
        Voter storage voter = voters[msg.sender];
        require(voter.voted, "You have not voted");
        require(!voter.hasClaimedRefund, "Refund already claimed");
        require(voter.vote != winningProposalId, "Winners cannot claim refund");

        voter.hasClaimedRefund = true;
        require(usdcToken.transfer(msg.sender, REFUND_AMOUNT), 
                "Refund transfer failed");
                
        emit RefundClaimed(msg.sender, REFUND_AMOUNT);
    }

    function winningProposal() public view returns (uint winningProposal_) {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    function winnerName() external view returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposalId].name;
    }
}