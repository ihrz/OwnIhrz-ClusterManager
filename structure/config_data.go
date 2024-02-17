package structure

type APIConfig struct {
	APIToken string `mapstructure:"apiToken"`
	ClientID string `mapstructure:"clientID"`
}

type Cluster struct {
	Port       string `mapstructure:"port"`
	MaxCluster int    `mapstructure:"max_container"`
}

type Container struct {
	GithubRepo string `mapstructure:"githubRepo"`
	BranchName string `mapstructure:"branchName"`
}

type Config struct {
	API       APIConfig `mapstructure:"api"`
	Cluster   Cluster   `mapstructure:"cluster"`
	Container Container `mapstructure:"container"`
}
