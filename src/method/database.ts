import config from './getConfigData.js';

import { logger } from 'ihorizon-tools';
import { PallasDB } from 'pallas-db';

let db: PallasDB;

export async function initializeDatabase() {
    logger.log(`🚀 >> Attempting to connect to the ${config?.database.type} database...`);

    // if (!connectionAvailable) {
    //     logger.err(`❌ >> Failed to connect to the ${config?.database.use_mongodb ? "MongoDB" : "MySQL"} database`);
    //     process.exit(9);
    // }

    try {
        logger.log(`🛠️  >> Connecting to ${config?.database.type} with QuickDB...`);
        db = new PallasDB({
            host: config?.database.host,
            username: config?.database.username,
            database: config?.database.database,
            password: config?.database.password,
            port: config?.database.port,
            dialect: config?.database.type,
            tables: ["OWNIHRZ"]
        })

    } catch (err) {
        logger.err(`❌ >> Error initializing PallasDB: ${err}`);
        process.exit(1);
    }

    logger.log(`✅ >> Successfully connected to the ${config?.database.type} database`);
}

export { db }
