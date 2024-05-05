export interface Custom_iHorizon {
    Auth: string;
    AdminKey: string;
    OwnerOne: string;
    OwnerTwo: string;
    Bot: {
        Id: string;
        Name: string;
        Public: boolean;
    };
    Code: string;
    ExpireIn: string;
    Lavalink: {
        NodeHost: string;
        NodeAuth: string;
    }
};