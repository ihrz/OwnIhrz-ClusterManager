package structure

type APIConfig struct {
	APIToken string `mapstructure:"apiToken"`
	ClientID string `mapstructure:"clientID"`
}

type Config struct {
	API APIConfig `mapstructure:"api"`
}
