package main

import (
	"fmt"
	"log"
	"server/method"
	"server/routes"

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

	routes.CreateContainer(app)
	routes.DeleteContainer(app)
	routes.StartupContainer(app)
	routes.PowerOnContainer(app)
	routes.ShutdownContainer(app)
	routes.ChangeToken(app)

	log.Fatal(app.Listen(":" + config.Cluster.Port))
}
