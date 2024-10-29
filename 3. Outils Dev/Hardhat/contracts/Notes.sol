// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Notes {
    mapping(uint => string) notes;

    constructor() {
        notes[0] = "salut c'est pas bon";
        notes[1] = "argh toujours pas";
        notes[4] = unicode"ça aurait pu mais non";
        notes[5] = unicode"Satoshi Nakamoto est en réalité Daniel Villa Monteiro";
    }

    function getNote(uint _note) external view returns (string memory) {
        if (bytes(notes[_note]).length==0){
            return "tu t'es perdu";
        } else {
        return notes[_note];
        }
    }
}