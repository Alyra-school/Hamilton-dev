// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract CAN is ERC721URIStorage {

    uint256 private tokenId;

    constructor() ERC721("Consulting Alyra NFT", "CAN") {}

    function faucetAlyra() public returns (uint256) {
        require(balanceOf(msg.sender) == 0, "T'en as deja");
        _mint(msg.sender, tokenId);
        tokenId++;
        return tokenId - 1;
    }

    function tokenURI(
        uint256 _tokenId
    ) public view override returns (string memory) {
        uint random = uint(keccak256(abi.encodePacked(msg.sender, _tokenId))) %
            101;
        if (random < 66) {
            return
                "https://beige-smoggy-cephalopod-644.mypinata.cloud/ipfs/QmPNah2Ytym2Jvn4Y8MR54jUAT1m8bEHq7ZVaPrbYfxd7B/1.json";
        } else if (random < 88) {
            return
                "https://beige-smoggy-cephalopod-644.mypinata.cloud/ipfs/QmPNah2Ytym2Jvn4Y8MR54jUAT1m8bEHq7ZVaPrbYfxd7B/2.json";
        } else if (random < 99) {
            return
                "https://beige-smoggy-cephalopod-644.mypinata.cloud/ipfs/QmPNah2Ytym2Jvn4Y8MR54jUAT1m8bEHq7ZVaPrbYfxd7B/3.json";
        } else {
            return
                "https://beige-smoggy-cephalopod-644.mypinata.cloud/ipfs/QmPNah2Ytym2Jvn4Y8MR54jUAT1m8bEHq7ZVaPrbYfxd7B/4.json";
        }
    }

}
