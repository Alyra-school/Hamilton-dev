// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity 0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract Alyra is ERC721, ERC721Enumerable, Ownable {
    uint256 private _nextTokenId;
    bytes32 public merkleRoot;

    mapping(address => bool) public hasMinted;

    constructor(address initialOwner, bytes32 _merkleRoot)
        ERC721("Alyra", "ALY")
        Ownable(initialOwner)
    {
        merkleRoot = _merkleRoot;
    }

    function safeMint(address to, bytes32[] calldata _proof) public {
        require(isWhitelisted(msg.sender, _proof), "Not Whitelisted");
        require(!hasMinted[msg.sender], "Already minted");
        hasMinted[msg.sender] = true;
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }

    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }

    function isWhitelisted(address _account, bytes32[] calldata _proof) internal view returns(bool) {
        bytes32 leaf = keccak256(abi.encode(keccak256(abi.encode(_account))));
        return MerkleProof.verify(_proof, merkleRoot, leaf);
    }

    // The following functions are overrides required by Solidity.

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
