package main

import (
	"fmt"
	"log"
	"server/method"
	v1 "server/routes/v1"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	config, err := method.LoadConfig()
	if err != nil {
		fmt.Print(err)
		panic(err)
	}

	app := fiber.New()

	app.Use(cors.New())

	app.Use("/api/instance/create", func(c *fiber.Ctx) error {
		if c.Is("json") {
			return c.Next()
		}
		return c.SendString("Only JSON allowed!")
	})

	v1.CreateContainer(app)
	v1.DeleteContainer(app)
	v1.StartupContainer(app)
	v1.PowerOnContainer(app)
	v1.ShutdownContainer(app)
	v1.ChangeToken(app)

	log.Fatal(app.Listen(":" + config.Cluster.Port))
}
