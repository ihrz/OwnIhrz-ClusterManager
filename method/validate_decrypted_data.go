package method

import "server/structure"

func ValidateDecryptedData(data *structure.CustomIhorizonData, config *structure.Config) bool {
	return data.AdminKey == config.API.APIToken &&
		data.OwnerOne != "" &&
		data.OwnerTwo != "" &&
		data.ExpireIn != 0 &&
		data.Bot.ID != "" &&
		data.Code != ""
}
