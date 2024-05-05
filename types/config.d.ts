
export interface ConfigType {

    cluster: {
        name: string;
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
        host: string;
        port: number;
        database: string;
        username: string;
        password: string;
    }
};