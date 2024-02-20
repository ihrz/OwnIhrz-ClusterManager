package routes

import (
	"fmt"
	"os"
	"os/exec"
	"server/method"
	"server/method/db"
	"server/structure"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func ChangeToken(app *fiber.App) {

	app.Post("/api/instance/change_token", func(c *fiber.Ctx) error {
		var data structure.CustomIhorizonData

		if err := c.BodyParser(&data); err != nil {
			fmt.Print(err)
			return c.Status(fiber.StatusBadRequest).SendString("Invalid request body")
		}

		db.Set(data.Code+"_online", false)

		cliArray := []struct {
			L   string
			CWD string
		}{
			{
				L:   strings.Replace("pm2 stop {Code}", "{Code}", data.Code, 1),
				CWD: method.PathResolve(method.ProcessCWD(), "ownihrz", data.Code),
			},

			{
				L:   strings.Replace("pm2 delete {Code}", "{Code}", data.Code, 1),
				CWD: method.PathResolve(method.ProcessCWD(), "ownihrz", data.Code),
			},

			{
				L:   strings.Replace("sed -i 's/token: \"[^\"]*\"/token: \"{Auth}\"/g' config.ts", "{Auth}", data.Auth, 1),
				CWD: method.PathResolve(method.ProcessCWD(), "ownihrz", data.Code, "src", "files"),
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

		return nil
	})

}
