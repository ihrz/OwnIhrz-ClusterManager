package v1

import (
	"fmt"
	"os"
	"os/exec"
	"server/method"
	"server/method/db"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func PowerOnContainer(app *fiber.App) {

	app.Get("/api/v1/instance/poweron/:bot_id/:admin_key/", func(c *fiber.Ctx) error {

		var bot_id = c.Params("bot_id")
		var admin_key = c.Params("admin_key")

		if !method.ValidateAdminKey(admin_key) {
			fmt.Println("[PowerOn] Erreur admin_key", admin_key, " n'est pas valide!")
			return c.Status(fiber.StatusBadRequest).SendString("Invalid admin_key!")
		}

		if _, err := os.Stat(method.PathResolve(method.ProcessCWD(), "ownihrz", bot_id)); os.IsNotExist(err) {
			fmt.Println("[PowerOn] Erreur bot_id", bot_id, " n'existe pas!")
			return c.Status(fiber.StatusBadRequest).SendString("Invalid bot_id!")
		}

		var IsOn = db.Get(bot_id + "_online")

		if !IsOn {
			cliArray := []struct {
				L   string
				CWD string
			}{
				{
					L:   "npx tsc",
					CWD: method.PathResolve(method.ProcessCWD(), "ownihrz", bot_id),
				},

				{
					L:   strings.Replace("mv dist/index.js dist/{Code}.js", "{Code}", bot_id, 1),
					CWD: method.PathResolve(method.ProcessCWD(), "ownihrz", bot_id),
				},

				{
					L:   strings.Replace("pm2 start dist/{Code}.js -f", "{Code}", bot_id, 1),
					CWD: method.PathResolve(method.ProcessCWD(), "ownihrz", bot_id),
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

		} else {
			fmt.Println("[PowerOn] Erreur tentative doublon!")
		}

		db.Set(bot_id+"_online", true)
		return c.SendStatus(200)
	})

}
