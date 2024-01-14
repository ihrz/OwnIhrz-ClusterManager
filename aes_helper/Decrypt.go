package aeshelper

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/hex"
)

type CustomIhorizonData struct {
	AdminKey string `json:"admin_key"`
	Auth     string `json:"auth"`
	OwnerOne string `json:"owner_one"`
	OwnerTwo string `json:"owner_two"`
	Bot      struct {
		ID string `json:"id"`
	} `json:"bot"`
	ExpireIn string `json:"expireIn"`
	Code     string `json:"code"`
}

// func Decrypt(encryptedString string, keyString string) (decryptedString string) {

// 	var key = keyString
// 	enc, _ := hex.DecodeString(encryptedString)

// 	//Create a new Cipher Block from the key
// 	block, err := aes.NewCipher(key)
// 	if err != nil {
// 		panic(err.Error())
// 	}

// 	//Create a new GCM
// 	aesGCM, err := cipher.NewGCM(block)
// 	if err != nil {
// 		panic(err.Error())
// 	}

// 	//Get the nonce size
// 	nonceSize := aesGCM.NonceSize()

// 	//Extract the nonce from the encrypted data
// 	nonce, ciphertext := enc[:nonceSize], enc[nonceSize:]

// 	// //Decrypt the data
// 	// plaintext, err := aesGCM.Open(nil, nonce, ciphertext, nil)
// 	// if err != nil {
// 	// 	panic(err.Error())
// 	// }

// 	// var decryptedData CustomIhorizonData
// 	// fmt.Println(decryptedData)

// 	// err = json.Unmarshal(plaintext, &decryptedData)
// 	// if err != nil {
// 	// 	return encryptedString
// 	// }

// 	// return fmt.Sprintf("%s", decryptedData)

// 	//Decrypt the data
// 	plaintext, err := aesGCM.Open(nil, nonce, ciphertext, nil)
// 	if err != nil {
// 		panic(err.Error())
// 	}

// 	return fmt.Sprintf("%s", plaintext)
// }

func Decrypt(encryptedString string, keyString string) (decryptedString string) {
	key, _ := hex.DecodeString(keyString)
	enc, _ := hex.DecodeString(encryptedString)

	// Create a new Cipher Block from the key
	block, err := aes.NewCipher(key)
	if err != nil {
		panic(err.Error())
	}

	// Create a new CBC decrypter
	decrypter := cipher.NewCBCDecrypter(block, enc[:aes.BlockSize])

	// Decrypt the data
	decryptedData := make([]byte, len(enc[aes.BlockSize:]))
	decrypter.CryptBlocks(decryptedData, enc[aes.BlockSize:])

	// Unpad the decrypted data
	decryptedData = unpadPKCS7(decryptedData)

	return string(decryptedData)
}

// unpadPKCS7 removes the PKCS#7 padding from the data
func unpadPKCS7(data []byte) []byte {
	padLength := int(data[len(data)-1])
	return data[:len(data)-padLength]
}
