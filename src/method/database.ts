import config from './getConfigData.js';

import { MySQLDriver, QuickDB } from 'quick.db';

let db: Promise<QuickDB> | undefined;

if (!db) {
    db = new Promise<QuickDB>(async (resolve, reject) => {
        console.log(`🚀 >> Connection attempt to the MYSQL database...`);

        let mysql = new MySQLDriver({
            host: config?.database.host,
            user: config?.database.username,
            password: config?.database.password,
            database: config?.database.database,
            port: config?.database?.port,
        });

        await mysql.connect();

        let temp = new QuickDB({
            driver: mysql
        });
        temp.table(`cluster${config?.cluster.id}`)

        resolve(temp);
    });
};

export default await db;