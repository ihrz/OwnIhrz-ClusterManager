package main

import (
	"log"
	"server/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
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
	routes.StartContainer(app)
	routes.StopContainer(app)

	log.Fatal(app.Listen(":3000"))
}
