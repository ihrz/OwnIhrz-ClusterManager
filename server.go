package main

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"encoding/json"
	"errors"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/spf13/viper"
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

type Config struct {
	API struct {
		APIToken string `mapstructure:"apiToken"`
	} `mapstructure:"api"`
}

func main() {
	app := fiber.New()

	app.Use(cors.New())

	app.Use(func(c *fiber.Ctx) error {
		if c.Is("json") {
			return c.Next()
		}
		return c.SendString("Only JSON allowed!")
	})

	app.Post("/api/publish", func(c *fiber.Ctx) error {
		var data map[string]interface{}
		if err := c.BodyParser(&data); err != nil {
			return err
		}

		cryptedJSON, ok := data["cryptedJSON"].(string)
		if !ok {
			return c.Status(fiber.StatusBadRequest).SendString("Invalid cryptedJSON")
		}

		decryptedData, err := decryptData(cryptedJSON)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString("Decryption failed")
		}

		config, err := loadConfig()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString("Failed to load config")
		}

		if !validateDecryptedData(decryptedData, config) {
			return c.Status(fiber.StatusBadRequest).SendString("Invalid data")
		}

		err = os.MkdirAll(filepath.Join(processCWD(), "ownihrz", decryptedData.Code), os.ModePerm)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString("Failed to create directory")
		}

		time.Sleep(1 * time.Second) // Simulating the wait function

		portRange := 29268

		cliArray := []struct {
			L   string
			CWD string
		}{
			{L: "git clone --branch ownihrz --depth 1 https://github.com/ihrz/ihrz.git .", CWD: pathResolve(processCWD(), "ownihrz", decryptedData.Code)},
			{L: "mv src/files/config.example.ts src/files/config.ts", CWD: pathResolve(processCWD(), "ownihrz", decryptedData.Code)},
			{L: `sed -i 's/|| "The bot token",/|| "${decryptedData.Auth}",/g' config.ts`, CWD: pathResolve(processCWD(), "ownihrz", decryptedData.Code, "src", "files")},
			{L: `sed -i 's/"The discord User ID of the Owner number One",/"${decryptedData.OwnerOne}",/' config.ts`, CWD: pathResolve(processCWD(), "ownihrz", decryptedData.Code, "src", "files")},
			{L: `sed -i 's/"The discord User ID of the Owner number Two",/"${decryptedData.OwnerTwo}",/' config.ts`, CWD: pathResolve(processCWD(), "ownihrz", decryptedData.Code, "src", "files")},
			{L: `sed -i 's/"login\.domain\.com"/"localhost"/' config.ts`, CWD: pathResolve(processCWD(), "ownihrz", decryptedData.Code, "src", "files")},
			{L: `sed -i 's/"apiToken": "The API'"'"'s token for create a request (Need to be private for security reason)",/"apiToken": "${config.API.APIToken}",/' config.ts`, CWD: pathResolve(processCWD(), "ownihrz", decryptedData.Code, "src", "files")},
			{L: `sed -i 's/"useProxy": false/"useProxy": true/' config.ts`, CWD: pathResolve(processCWD(), "ownihrz", decryptedData.Code, "src", "files")},
			{L: `sed -i 's/"proxyUrl": "https:\\/\\/login\\.example\\.com"/"proxyUrl": "https:\\/\\/srv\\.ihorizon\\.me"/' config.ts`, CWD: pathResolve(processCWD(), "ownihrz", decryptedData.Code, "src", "files")},
			{L: `sed -i 's/"The client ID of your application"/"${config.API.ClientID}"/' config.ts`, CWD: pathResolve(processCWD(), "ownihrz", decryptedData.Code, "src", "files")},
			{L: `sed -i 's/"3000"/"${portRange}"/' config.ts`, CWD: pathResolve(processCWD(), "ownihrz", decryptedData.Code, "src", "files")},
			{L: `sed -i 's/"blacklistPictureInEmbed": "The image of the blacklist'\\''s Embed (When blacklisted user attempt to interact with the bot)",/"blacklistPictureInEmbed": "https:\\/\\/media.discordapp.net\\/attachments\\/1099043567659384942\\/1119214828330950706\\/image.png",/' config.ts`, CWD: pathResolve(processCWD(), "ownihrz", decryptedData.Code, "src", "files")},
			{L: `cp -r ./node_modules/ ./ownihrz/${decryptedData.Code}/node_modules/`, CWD: processCWD()},
			{L: "npx tsc", CWD: pathResolve(processCWD(), "ownihrz", decryptedData.Code)},
			{L: `mv dist/index.js dist/${decryptedData.Code}.js`, CWD: pathResolve(processCWD(), "ownihrz", decryptedData.Code)},
			{L: `pm2 start ./dist/${decryptedData.Code}.js -f`, CWD: pathResolve(processCWD(), "ownihrz", decryptedData.Code)},
		}

		for _, index := range cliArray {
			cmd := exec.Command("sh", "-c", index.L)
			cmd.Dir = index.CWD
			cmd.Stdout = os.Stdout
			cmd.Stderr = os.Stderr
			if err := cmd.Run(); err != nil {
				return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
			}
		}

		err = setDatabaseEntry(decryptedData, portRange)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
		}

		return nil
	})

	log.Fatal(app.Listen(":3000"))
}

func decryptData(cryptedJSON string) (*CustomIhorizonData, error) {
	key := []byte("your_encryption_key") // Replace with your actual encryption key
	ciphertext, err := base64.StdEncoding.DecodeString(cryptedJSON)
	if err != nil {
		return nil, err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	if len(ciphertext) < aes.BlockSize {
		return nil, errors.New("ciphertext too short")
	}

	iv := ciphertext[:aes.BlockSize]
	ciphertext = ciphertext[aes.BlockSize:]

	mode := cipher.NewCBCDecrypter(block, iv)
	mode.CryptBlocks(ciphertext, ciphertext)

	// Unpad the result
	padding := int(ciphertext[len(ciphertext)-1])
	ciphertext = ciphertext[:len(ciphertext)-padding]

	var decryptedData CustomIhorizonData
	err = json.Unmarshal(ciphertext, &decryptedData)
	if err != nil {
		return nil, err
	}

	return &decryptedData, nil
}

func loadConfig() (*Config, error) {
	var config Config
	viper.SetConfigFile("config.yaml")
	err := viper.ReadInConfig()
	if err != nil {
		return nil, err
	}
	err = viper.Unmarshal(&config)
	if err != nil {
		return nil, err
	}
	return &config, nil
}

func validateDecryptedData(data *CustomIhorizonData, config *Config) bool {
	return data.Auth == config.API.APIToken &&
		data.OwnerOne != "" &&
		data.OwnerTwo != "" &&
		data.ExpireIn != "" &&
		data.Bot.ID != "" &&
		data.Code != ""
}

func processCWD() string {
	dir, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}
	return dir
}

func pathResolve(elem ...string) string {
	return filepath.Join(elem...)
}

func setDatabaseEntry(data *CustomIhorizonData, portRange int) error {
	// Implement your logic to set data into the database
	return nil
}
