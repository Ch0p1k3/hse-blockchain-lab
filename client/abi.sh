#/bin/bash

rm -rf build
mkdir build
solc --include-path ../node_modules --base-path . --bin --abi ../contracts/EmeraldToken.sol -o build
abigen --abi build/EmeraldToken.abi --bin build/EmeraldToken.bin --pkg main --out token.go
