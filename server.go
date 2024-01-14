package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
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

type APIConfig struct {
	APIToken string `mapstructure:"apiToken"`
	ClientID string `mapstructure:"clientID"`
}

type Config struct {
	API APIConfig `mapstructure:"api"`
	// Ajoute d'autres champs si nécessaire
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
		var data CustomIhorizonData

		// Utiliser c.BodyParser pour remplir la structure de données à partir du corps de la requête
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).SendString("Invalid request body")
		}

		if err := c.BodyParser(&data); err != nil {
			return err
		}

		config, err := loadConfig()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString("Failed to load config")
		}

		if err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString("Decryption failed")
		}

		if !validateDecryptedData(&data, config) {
			return c.Status(fiber.StatusBadRequest).SendString("Invalid data")
		}

		err = os.MkdirAll(filepath.Join(processCWD(), "ownihrz", data.Code), os.ModePerm)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString("Failed to create directory")
		}

		time.Sleep(1 * time.Second) // Simulating the wait function

		portRange := 29268

		cliArray := []struct {
			L   string
			CWD string
		}{
			{L: "git clone --branch ownihrz --depth 1 https://github.com/ihrz/ihrz.git .", CWD: pathResolve(processCWD(), "ownihrz", data.Code)},
			{L: "mv src/files/config.example.ts src/files/config.ts", CWD: pathResolve(processCWD(), "ownihrz", data.Code)},
			{L: strings.Replace(`sed -i 's/|| "The bot token",/|| "${Auth}",/g' config.ts`, "${Auth}", data.Auth, 1), CWD: pathResolve(processCWD(), "ownihrz", data.Code, "src", "files")},
			{L: strings.Replace(`sed -i 's/"The discord User ID of the Owner number One",/"${OwnerOne}",/' config.ts`, "${OwnerOne}", data.OwnerOne, 1), CWD: pathResolve(processCWD(), "ownihrz", data.Code, "src", "files")},
			{L: strings.Replace(`sed -i 's/"The discord User ID of the Owner number Two",/"${OwnerTwo}",/' config.ts`, "${OwnerTwo}", data.OwnerTwo, 1), CWD: pathResolve(processCWD(), "ownihrz", data.Code, "src", "files")},
			{L: strings.Replace(`sed -i 's/"login\.domain\.com"/"localhost"/' config.ts`, "${PortRange}", strconv.Itoa(portRange), 1), CWD: pathResolve(processCWD(), "ownihrz", data.Code, "src", "files")},
			{L: strings.Replace(`sed -i 's/"apiToken": "The API'"'"'s token for create a request (Need to be private for security reason)",/"apiToken": "${config.API.APIToken}",/' config.ts`, "${APIToken}", config.API.APIToken, 1), CWD: pathResolve(processCWD(), "ownihrz", data.Code, "src", "files")},
			{L: strings.Replace(`sed -i 's/"useProxy": false/"useProxy": true/' config.ts`, "${UseProxy}", "true", 1), CWD: pathResolve(processCWD(), "ownihrz", data.Code, "src", "files")},
			{L: strings.Replace(`sed -i 's/"proxyUrl": "https:\\/\\/login\\.example\\.com"/"proxyUrl": "${ProxyURL}"/' config.ts`, "${ProxyURL}", "https:\\/\\/srv\\.ihorizon\\.me", 1), CWD: pathResolve(processCWD(), "ownihrz", data.Code, "src", "files")},
			{L: strings.Replace(`sed -i 's/"The client ID of your application"/"${ClientID}"/' config.ts`, "${ClientID}", config.API.ClientID, 1), CWD: pathResolve(processCWD(), "ownihrz", data.Code, "src", "files")},
			{L: strings.Replace(`sed -i 's/"3000"/"${PortRange}"/' config.ts`, "${PortRange}", strconv.Itoa(portRange), 1), CWD: pathResolve(processCWD(), "ownihrz", data.Code, "src", "files")},
			{L: strings.Replace(`sed -i 's/"blacklistPictureInEmbed": "The image of the blacklist'\\''s Embed (When blacklisted user attempt to interact with the bot)",/"blacklistPictureInEmbed": "${BlacklistPictureInEmbed}",/' config.ts`, "${BlacklistPictureInEmbed}", "https:\\/\\/media.discordapp.net\\/attachments\\/1099043567659384942\\/1119214828330950706\\/image.png", 1), CWD: pathResolve(processCWD(), "ownihrz", data.Code, "src", "files")},
			{L: "cp -r ./node_modules/ ./ownihrz/${Code}/node_modules/", CWD: processCWD()},
			{L: "npx tsc", CWD: pathResolve(processCWD(), "ownihrz", data.Code)},
			{L: strings.Replace(`mv dist/index.js dist/${Code}.js`, "${Code}", data.Code, 1), CWD: pathResolve(processCWD(), "ownihrz", data.Code)},
			{L: strings.Replace(`pm2 start ./dist/${Code}.js -f`, "${Code}", data.Code, 1), CWD: pathResolve(processCWD(), "ownihrz", data.Code)},
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

		// err = setDatabaseEntry(data, portRange)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
		}

		return nil
	})

	log.Fatal(app.Listen(":3000"))
}

func loadConfig() (*Config, error) {
	var config Config
	viper.SetConfigFile("config.yaml")
	err := viper.ReadInConfig()
	if err != nil {
		fmt.Println("Error reading config file:", err)
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
