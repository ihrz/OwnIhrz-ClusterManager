package method

import (
	"fmt"
	"server/structure"

	"github.com/spf13/viper"
)

func LoadConfig() (*structure.Config, error) {
	var config structure.Config
	viper.SetConfigFile("config.yaml")
	err := viper.ReadInConfig()
	if err != nil {
		fmt.Println("Error reading config file:", err)
		return nil, err
	}

	err = viper.Unmarshal(&config)
	if err != nil {
		return nil, err
	}
	return &config, nil
}
