import config from './getConfigData.js';
import { QuickDB } from 'quick.db';
import { MongoClient } from 'mongodb';
import { logger } from 'ihorizon-tools';
import { MongoDriver } from 'quickmongo';

let db: QuickDB<any>;

async function isMongoDBReachable(mongoUri: string): Promise<boolean> {
    let client: MongoClient | null = null;
    try {
        client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000 });
        await client.connect();
        logger.log('✅ >> MongoDB connection successful.');
        return true;
    } catch (error) {
        logger.err(`❌ >> Error connecting to MongoDB: ${error}`);
        return false;
    } finally {
        await client?.close().catch(() => {
            logger.warn('⚠️ >> Error closing MongoDB connection.');
        });
    }
}

export async function initializeDatabase() {
    logger.log(`🚀 >> Attempting to connect to the MongoDB database...`);
    const connectionAvailable = await isMongoDBReachable(config?.database.mongodb_uri!);

    if (!connectionAvailable) {
        logger.err('❌ >> Failed to connect to the MongoDB database');
        process.exit(1);
    }

    try {
        logger.log('🛠️  >> Connecting to MongoDB with QuickDB...');
        const mongo = new MongoDriver(config?.database.mongodb_uri!);

        await mongo.connect();
        logger.log('✅ >> QuickDB MongoDriver connected.');

        db = new QuickDB({ driver: mongo });
    } catch (err) {
        logger.err(`❌ >> Error initializing QuickDB: ${err}`);
        process.exit(1);
    }

    logger.log('✅ >> Successfully connected to the MongoDB database');
}

export { db }
