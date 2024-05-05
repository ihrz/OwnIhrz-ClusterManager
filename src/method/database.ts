import { MySQLDriver, QuickDB } from 'quick.db';
import getConfigData from './getConfigData.js';

const config = getConfigData();

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

        resolve(new QuickDB({
            driver: mysql
        }));
    });
};

export default await db;