pragma solidity ^0.6.0;

library CommonUtils {

    function getHash(string memory str) internal pure returns (bytes32) {
        return keccak256(bytes(str));
    }

    function getHash(string memory str, uint index) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(str, index));
    }

    function concStr(string memory s1, string memory s2) internal pure returns (string memory) {
        return string(abi.encodePacked(s1, s2));
    }

    function random(uint ceiling, uint count, uint salt) internal view returns (uint[] memory) {
        if (count > 256) {
            count = 256;
        }
        uint[] memory result = new uint[](count);
        for (uint i = 0; i < count; i++) {
            result[i] = uint256(blockhash(block.number - 1 - i) ^ keccak256(abi.encodePacked(salt + i))) % ceiling;
        }
        return result;
    }

    function shuffle(uint[] memory array, uint count) internal view returns (uint[] memory) {
        uint[] memory rans = random(array.length, count * 2, block.timestamp);
        for (uint i = 0; i < count; i += 2) {
            uint big = rans[i] > rans[i + 1] ? rans[i] : rans[i + 1];
            uint small = rans[i] > rans[i + 1] ? rans[i + 1] : rans[i];
            while (big > small) {
                uint temp = array[small];
                array[small] = array[big];
                array[big] = temp;
                small++;
                big--;
            }
        }
        return array;
    }
}
