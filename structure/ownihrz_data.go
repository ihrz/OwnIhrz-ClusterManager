package structure

type CustomIhorizonData struct {
	Auth     string `json:"auth"`
	AdminKey string `json:"admin_key"`
	OwnerOne string `json:"owner_one"`
	OwnerTwo string `json:"owner_two"`
	Bot      struct {
		ID string `json:"id"`
	} `json:"bot"`
	ExpireIn int64  `json:"expireIn"`
	Code     string `json:"code"`
}
