package method

import (
	"log"
	"os"
	"path/filepath"
)

func ProcessCWD() string {
	dir, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}
	return dir
}

func PathResolve(elem ...string) string {
	return filepath.Join(elem...)
}
