// ./routes/create_container.go
package routes

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"server/method"
	"server/method/db"
	"server/structure"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func CreateContainer(app *fiber.App) {

	app.Post("/api/instance/create", func(c *fiber.Ctx) error {
		var data structure.CustomIhorizonData

		if err := c.BodyParser(&data); err != nil {
			fmt.Print(err)
			return c.Status(fiber.StatusBadRequest).SendString("Invalid request body")
		}

		config, err := method.LoadConfig()
		if err != nil {
			fmt.Print(err)
			return c.Status(fiber.StatusInternalServerError).SendString("Failed to load config")
		}

		if !method.ValidateDecryptedData(&data, config) {
			fmt.Println("Erreur")
			return c.Status(fiber.StatusBadRequest).SendString("Invalid data")
		}

		err = os.MkdirAll(filepath.Join(method.ProcessCWD(), "ownihrz", data.Code), os.ModePerm)
		if err != nil {
			fmt.Print(err)
			return c.Status(fiber.StatusInternalServerError).SendString("Failed to create directory")
		}

		portRange := 29268

		GitCloneCommandFormated := strings.Replace("git clone --branch {branchName} --depth 1 {repoName} .", "{branchName}", config.Container.BranchName, 1)

		cliArray := []struct {
			L   string
			CWD string
		}{
			{
				L:   strings.Replace(GitCloneCommandFormated, "{repoName}", config.Container.GithubRepo, 1),
				CWD: method.PathResolve(method.ProcessCWD(), "ownihrz", data.Code),
			},

			{
				L:   "bun install",
				CWD: method.PathResolve(method.ProcessCWD(), "ownihrz", data.Code),
			},

			{
				L:   "mv src/files/config.example.ts src/files/config.ts",
				CWD: method.PathResolve(method.ProcessCWD(), "ownihrz", data.Code),
			},

			{
				L:   strings.Replace("sed -i 's/token: \"The bot token\"/token: \"{Auth}\"/' config.ts", "{Auth}", data.Auth, 1),
				CWD: method.PathResolve(method.ProcessCWD(), "ownihrz", data.Code, "src", "files"),
			},

			{
				L:   strings.Replace("sed -i 's/ownerid1: \"User id\",/ownerid1: \"{OwnerOne}\",/' config.ts", "{OwnerOne}", data.OwnerOne, 1),
				CWD: method.PathResolve(method.ProcessCWD(), "ownihrz", data.Code, "src", "files"),
			},

			{
				L:   strings.Replace("sed -i 's/ownerid2: \"User id\",/ownerid2: \"{OwnerTwo}\",/' config.ts", "{OwnerTwo}", data.OwnerTwo, 1),
				CWD: method.PathResolve(method.ProcessCWD(), "ownihrz", data.Code, "src", "files"),
			},

			{
				L:   strings.Replace("sed -i 's/apiToken: \"The api token\",/apiToken: \"{APIToken}\",/' config.ts", "{APIToken}", config.API.APIToken, 1),
				CWD: method.PathResolve(method.ProcessCWD(), "ownihrz", data.Code, "src", "files"),
			},

			{
				L:   "sed -i 's/useProxy: false/useProxy: true/' config.ts",
				CWD: method.PathResolve(method.ProcessCWD(), "ownihrz", data.Code, "src", "files"),
			},

			{
				L:   "sed -i 's/proxyUrl: \"https:\\/\\/login\\.domain\\.com\"/proxyUrl: \"https:\\/\\/srv\\.ihorizon\\.me\"/' config.ts",
				CWD: method.PathResolve(method.ProcessCWD(), "ownihrz", data.Code, "src", "files"),
			},

			{
				L:   strings.Replace("sed -i 's/clientSecret: \"The client secret\"/clientSecret: \"{ClientID}\"/g' config.ts", "{ClientID}", config.API.ClientID, 1),
				CWD: method.PathResolve(method.ProcessCWD(), "ownihrz", data.Code, "src", "files"),
			},

			{
				L:   strings.Replace("sed -i 's/\"3000\"/\"{PortRange}\"/' config.ts", "{PortRange}", strconv.Itoa(portRange), 1),
				CWD: method.PathResolve(method.ProcessCWD(), "ownihrz", data.Code, "src", "files"),
			},

			{
				L:   "sed -i 's/blacklistPictureInEmbed: \"An png url\",/blacklistPictureInEmbed: \"https:\\/\\/media\\.discordapp\\.net\\/attachments\\/1099043567659384942\\/1119214828330950706\\/image\\.png\",/' config.ts",
				CWD: method.PathResolve(method.ProcessCWD(), "ownihrz", data.Code, "src", "files"),
			},

			{
				L:   strings.Replace("sed -i 's/host: \"lavalink.example.com\"/host: \"{NodeURL}\"/' config.ts", "{NodeURL}", data.Lavalink.NodeURL, '1'),
				CWD: method.PathResolve(method.ProcessCWD(), "ownihrz", data.Code, "src", "files"),
			},

			{
				L:   strings.Replace("sed -i 's/authorization: \"password\"/authorization: \"{NodeAuth}\"/' config.ts", "{NodeAuth}", data.Lavalink.NodeAuth, 1),
				CWD: method.PathResolve(method.ProcessCWD(), "ownihrz", data.Code, "src", "files"),
			},

			{
				L:   "npx tsc",
				CWD: method.PathResolve(method.ProcessCWD(), "ownihrz", data.Code),
			},

			{
				L:   strings.Replace("mv dist/index.js dist/{Code}.js", "{Code}", data.Code, 1),
				CWD: method.PathResolve(method.ProcessCWD(), "ownihrz", data.Code),
			},

			{
				L:   strings.Replace("pm2 start ./dist/{Code}.js -f", "{Code}", data.Code, 1),
				CWD: method.PathResolve(method.ProcessCWD(), "ownihrz", data.Code),
			},
		}

		for _, index := range cliArray {
			cmd := exec.Command("sh", "-c", index.L)
			cmd.Dir = index.CWD
			cmd.Stdout = os.Stdout
			cmd.Stderr = os.Stderr
			if err := cmd.Run(); err != nil {
				fmt.Print(err)
				return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
			}
		}

		db.Set(data.Code+"_online", true)

		if err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
		}

		return nil
	})

}
