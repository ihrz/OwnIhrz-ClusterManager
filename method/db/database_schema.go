package db

import (
	"fmt"
	"io/ioutil"
	"strconv"
	"strings"
)

const databaseFile = "stats.txt"

func Set(key string, value bool) {

	data, err := ioutil.ReadFile(databaseFile)
	if err != nil {
		panic(err)
	}

	lines := strings.Split(string(data), "\n")
	found := false
	for i, line := range lines {
		parts := strings.Split(line, "=")
		if len(parts) == 2 && parts[0] == key {

			lines[i] = fmt.Sprintf("%s=%t", key, value)
			found = true
			break
		}
	}

	if !found {
		lines = append(lines, fmt.Sprintf("%s=%t", key, value))
	}

	err = ioutil.WriteFile(databaseFile, []byte(strings.Join(lines, "\n")), 0644)
	if err != nil {
		fmt.Println("Erreur lors de l'écriture dans la base de données.")
	}
}

func Get(key string) bool {
	data, err := ioutil.ReadFile(databaseFile)
	if err != nil {
		return false
	}

	lines := strings.Split(string(data), "\n")
	for _, line := range lines {
		parts := strings.Split(line, "=")
		if len(parts) == 2 && parts[0] == key {

			value, err := strconv.ParseBool(parts[1])
			if err != nil {
				fmt.Println("Erreur lors de la conversion du booléen.")
				return false
			}
			return value
		}
	}

	return false
}
