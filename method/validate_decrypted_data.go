package method

import (
	"fmt"
	"server/structure"
)

func ValidateDecryptedData(data *structure.CustomIhorizonData, config *structure.Config) bool {
	return data.AdminKey == config.API.APIToken &&
		data.OwnerOne != "" &&
		data.OwnerTwo != "" &&
		data.ExpireIn != 0 &&
		data.Bot.ID != "" &&
		data.Code != ""
}

func ValidateAdminKey(key string) bool {
	config, err := LoadConfig()
	if err != nil {
		fmt.Print(err)
		return false
	}

	return key == config.API.APIToken
}
