package main

import (
	"context"
	"crypto/ecdsa"
	"fmt"
	"log"
	"math/big"
	"os"
	"strings"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/joho/godotenv"
)

func init() {
	if err := godotenv.Load(); err != nil {
		log.Print("No .env file found")
	}
}

func getTransactionOpts(client *ethclient.Client, privateKey *ecdsa.PrivateKey) (*bind.TransactOpts, error) {
	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		return nil, fmt.Errorf("error casting public key to ECDSA")
	}

	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)
	nonce, err := client.PendingNonceAt(context.Background(), fromAddress)
	if err != nil {
		return nil, err
	}

	gasPrice, err := client.SuggestGasPrice(context.Background())
	if err != nil {
		return nil, err
	}

	auth := bind.NewKeyedTransactor(privateKey)
	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0)     // in wei
	auth.GasLimit = uint64(300000) // in units
	auth.GasPrice = gasPrice

	return auth, nil
}

func main() {
	apiKey := os.Getenv("API_KEY")
	prKey := os.Getenv("PRIVATE_KEY")

	client, err := ethclient.Dial("https://goerli.infura.io/v3/" + apiKey)
	if err != nil {
		panic(err)
	}

	privateKey, err := crypto.HexToECDSA(prKey)
	if err != nil {
		panic(err)
	}

	authAdd, err := getTransactionOpts(client, privateKey)
	if err != nil {
		panic(err)
	}

	address := common.HexToAddress("0x95E72Ebd9F722e0F6AD5fcd3a29F446B7fDf7e5f")
	instance, err := NewMain(address, client)
	if err != nil {
		panic(err)
	}

	txAdd, err := instance.AddFilm(authAdd, "lol", big.NewInt(2023), 0)
	if err != nil {
		panic(err)
	}

	fmt.Printf("tx add film send: %s\n", txAdd.Hash().Hex())

	authDelete, err := getTransactionOpts(client, privateKey)
	if err != nil {
		panic(err)
	}

	txDel, err := instance.DeleteFilm(authDelete, "lol")
	if err != nil {
		panic(err)
	}

	fmt.Printf("tx delete film send: %s\n", txDel.Hash().Hex())

	logs, err := client.FilterLogs(context.Background(), ethereum.FilterQuery{
		FromBlock: big.NewInt(8568585),
        ToBlock: big.NewInt(8568585),
        Addresses: []common.Address{address},
	})
	if err != nil {
		panic(err)
	}

    contractAbi, err := abi.JSON(strings.NewReader(string(MainABI)))


	for _, vLog := range logs {
        fmt.Println(vLog.BlockHash.Hex())
        fmt.Println(vLog.BlockNumber)
        fmt.Println(vLog.TxHash.Hex())
        fmt.Println(vLog.Data)
        p, err := contractAbi.Unpack("FilmAdded", vLog.Data)
        if err != nil {
            panic(err)
        }
        fmt.Println(p)
    }


	return
}
