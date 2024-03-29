package routes

import (
	"fmt"
	"os"
	"os/exec"
	"server/method"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func DeleteContainer(app *fiber.App) {

	app.Get("/api/instance/delete/:bot_id/:admin_key", func(c *fiber.Ctx) error {

		var bot_id = c.Params("bot_id")
		var admin_key = c.Params("admin_key")

		if !method.ValidateAdminKey(admin_key) {
			fmt.Println("[Delete] Erreur admin_key", admin_key, " n'est pas valide!")
			return c.Status(fiber.StatusBadRequest).SendString("Invalid admin_key!")
		}

		if _, err := os.Stat(method.PathResolve(method.ProcessCWD(), "ownihrz", bot_id)); os.IsNotExist(err) {
			fmt.Println("[Delete] Erreur bot_id", bot_id, " n'existe pas!")
			return c.Status(fiber.StatusBadRequest).SendString("Invalid bot_id!")
		}

		cliArray := []struct {
			L   string
			CWD string
		}{
			{
				L:   strings.Replace("pm2 stop {Code} -f", "{Code}", bot_id, 1),
				CWD: method.PathResolve(method.ProcessCWD(), "ownihrz", bot_id),
			},

			{
				L:   strings.Replace("pm2 delete {Code}", "{Code}", bot_id, 1),
				CWD: method.PathResolve(method.ProcessCWD(), "ownihrz", bot_id),
			},

			{
				L:   strings.Replace("rm -r --interactive=never {Code}", "{Code}", bot_id, 1),
				CWD: method.PathResolve(method.ProcessCWD(), "ownihrz"),
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

		return c.SendStatus(200)
	})
}
