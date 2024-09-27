export interface Custom_iHorizon {
    Auth: string;
    AdminKey: string;
    OwnerOne: string;
    OwnerTwo: string;
    Prefix: string | null;
    Bot: {
        Id: string;
        Name: string;
        Public: boolean;
    };
    Code: string;
    ExpireIn: number;
};