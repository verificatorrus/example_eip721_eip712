// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

contract Voucher1 is ERC721, ERC721URIStorage, Ownable, EIP712 {
    string private constant SIGNING_DOMAIN = "Voucher-Domain";
    string private constant SIGNATURE_VERSION = "1";
    address public minter;

    constructor() ERC721("Voucher1", "VCT") EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {
        minter = msg.sender;
    }

     struct Voucher {
        uint256 tokenId;
        uint256 price;
        string uri;
        address buyer;
        bytes signature;
    }

    function setMinter(address newMinter) public onlyOwner
    {
        minter = newMinter;
    }

    function recover(Voucher calldata voucher) public view returns (address) {
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
            keccak256("Voucher(uint256 tokenId,uint256 price,string uri,address buyer)"),
            voucher.tokenId,
            voucher.price,
            keccak256(bytes(voucher.uri)),
            voucher.buyer
        )));
        address signer = ECDSA.recover(digest, voucher.signature);
        return signer;
    }

    function safeMint(Voucher calldata voucher)
        public
        payable
    {
        require(minter == recover(voucher), "Wrong signature.");
        require(msg.sender == voucher.buyer, "This NFT is not assigned for you");
        require(msg.value >= voucher.price, "Not enough ether sent.");
        _safeMint(voucher.buyer, voucher.tokenId);
        _setTokenURI(voucher.tokenId, voucher.uri);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}