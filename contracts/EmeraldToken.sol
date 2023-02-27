// SPDX-License-Identifier: Academic Free License v3.0
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EmeraldToken is Ownable, ERC20 {
    constructor(uint256 amount) ERC20("Emerald", "EMD") {
        _mint(msg.sender, amount);
    }

    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }

    enum Genre {
        Horror,
        Romantic,
        Drama
    }

    struct Film {
        string title;
        uint year;
        Genre genre;
    }

    mapping(string => Film) films;

    event FilmAdded(string title, uint year, Genre genre);
    event FilmDeleted(string title);

    function addFilm(string memory title, uint year, Genre genre) public {
        films[title] = Film(title, year, genre);
        emit FilmAdded(title, year, genre);
    }

    function deleteFilm(string memory title) public {
        delete films[title];
        emit FilmDeleted(title);
    }
}
