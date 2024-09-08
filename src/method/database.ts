import config from './getConfigData.js';
import { MySQLDriver, QuickDB } from 'quick.db';
import { MongoClient } from 'mongodb';
import { logger } from 'ihorizon-tools';
import { MongoDriver } from 'quickmongo';
import mysql from "mysql2/promise.js"

let db: QuickDB<any>;

async function isMongoDBReachable(mongoUri: string): Promise<boolean> {
    let client: MongoClient | null = null;
    try {
        client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000 });
        await client.connect();
        return true;
    } catch (error) {
        return false;
    } finally {
        await client?.close().catch(() => {
            logger.warn('⚠️ >> Error closing MongoDB connection.');
        });
    }
}

async function isMySqlReachable(database: any): Promise<boolean> {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: database.host,
            user: database.username,
            database: database.database,
            password: database.password,
            port: database.port
        });
        await connection.end();
        return true;
    } catch (error) {
        return false;
    } finally {
        if (connection && connection.end) {
            await connection.end();
        }
    }
};


export async function initializeDatabase() {
    logger.log(`🚀 >> Attempting to connect to the ${config?.database.use_mongodb ? "MongoDB" : "MySQL"} database...`);
    const connectionAvailable = config?.database.use_mongodb ? await isMongoDBReachable(config?.database.mongodb_uri!) : isMySqlReachable(config?.database);

    if (!connectionAvailable) {
        logger.err(`❌ >> Failed to connect to the ${config?.database.use_mongodb ? "MongoDB" : "MySQL"} database`);
        process.exit(9);
    }

    try {
        logger.log(`🛠️  >> Connecting to ${config?.database.use_mongodb ? "MongoDB" : "MySQL"} with QuickDB...`);
        const driver = config?.database.use_mongodb ? new MongoDriver(config?.database.mongodb_uri!) : new MySQLDriver({
            host: config?.database.host,
            user: config?.database.username,
            database: config?.database.database,
            password: config?.database.password,
            port: config?.database.port
        })

        await driver.connect();
        logger.log(`✅ >> QuickDB ${config?.database.use_mongodb ? "Mongo" : "Sql"}Driver connected.`);

        db = new QuickDB({ driver });
    } catch (err) {
        logger.err(`❌ >> Error initializing QuickDB: ${err}`);
        process.exit(1);
    }

    logger.log(`✅ >> Successfully connected to the ${config?.database.use_mongodb ? "MongoDB" : "MySQL"} database`);
}

export { db }
