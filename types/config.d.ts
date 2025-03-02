
export interface ConfigType {

    cluster: {
        id: number;
        max_container: number;
        port: number;
    }

    api: {
        apiToken: string;
        clientId: string;
        webhook: string;
    }

    container: {
        githubRepo: string;
        branchName: string;
    }

    database: {
        type: "mysql" | "postgres"
        host: string;
        port: number;
        database: string;
        username: string;
        password: string;
    }
};