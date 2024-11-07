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

export interface OwnIHRZ_New_Owner_Object {
    OldOwnerOne: string;
    NewOwnerOne: string;
    NewOwnerTwo: string;
}

export interface OwnIHRZ_New_Owner_RequestBody {
    botId: string;
    adminKey: string;
    OwnerData: OwnIHRZ_New_Owner_Object;
}

export interface OwnIHRZ_New_Time_Object {
    method: "sub" | "add",
    ms: number;
}

export interface OwnIHRZ_New_Time_RequestBody {
    botId: string;
    adminKey: string;
    data: OwnIHRZ_New_Time_Object;
}