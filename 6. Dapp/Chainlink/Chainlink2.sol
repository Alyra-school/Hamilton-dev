// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

contract VRFD20 is VRFConsumerBaseV2Plus {

    uint256 s_subscriptionId;

    address vrfCoordinator = 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B;
    bytes32 s_keyHash = 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;

    uint32 callbackGasLimit = 40000;
    uint16 requestConfirmations = 3;
    uint32 numWords =  1;

    uint public randomm100;

    event ChainlinkAsked(uint256 indexed requestId);
    event ChainlinkReply(uint256 indexed requestId, uint256 indexed result);


    constructor(uint256 subscriptionId) VRFConsumerBaseV2Plus(vrfCoordinator) {
        s_subscriptionId = subscriptionId;
    }
    
    function launchRandom() public onlyOwner returns (uint256 requestId) {
        // Will revert if subscription is not set and funded.
       requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: s_keyHash,
                subId: s_subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: numWords,
                // Set nativePayment to true to pay for VRF requests with Sepolia ETH instead of LINK
                extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: false}))
            })
        );

        emit ChainlinkAsked(requestId);
    }  

    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {

        randomm100 = (randomWords[0] % 100) + 1;
        emit ChainlinkReply(requestId, randomWords[0]);
    }
}