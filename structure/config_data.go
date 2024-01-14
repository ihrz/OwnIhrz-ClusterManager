package structure

type APIConfig struct {
	APIToken string `mapstructure:"apiToken"`
	ClientID string `mapstructure:"clientID"`
}

type Cluster struct {
	name       string `mapstructure:"name"`
	MaxCluster int    `mapstructure:"max_container"`
}

type Config struct {
	API     APIConfig `mapstructure:"api"`
	Cluster Cluster   `mapstructure:"cluster"`
}
