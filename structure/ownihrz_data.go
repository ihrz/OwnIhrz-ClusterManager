package structure

type CustomIhorizonData struct {
	Auth     string `json:"Auth"`
	AdminKey string `json:"AdminKey"`
	OwnerOne string `json:"OwnerOne"`
	OwnerTwo string `json:"OwnerTwo"`
	Bot      struct {
		ID     string `json:"Id"`
		Name   string `json:"Name"`
		Public bool   `json:"Public"`
	} `json:"Bot"`
	ExpireIn int64  `json:"ExpireIn"`
	Code     string `json:"Code"`
}
