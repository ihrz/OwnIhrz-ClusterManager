
export interface ConfigType {

    cluster: {
        id: number;
        max_container: number;
        port: number;
    }

    api: {
        apiToken: string;
        clientId: string;
    }

    container: {
        githubRepo: string;
        branchName: string;
    }

    database: {
        use_mongodb: boolean;
        mongodb_uri: string;
        host: string;
        port: number;
        database: string;
        username: string;
        password: string;
    }
};