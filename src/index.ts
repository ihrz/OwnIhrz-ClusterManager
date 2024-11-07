import { execSync } from 'child_process';

execSync("git pull", {
    stdio: [0, 1, 2],
    cwd: process.cwd()
});
execSync("rm dist -r", {
    stdio: [0, 1, 2],
    cwd: process.cwd()
});
execSync("npx tsc", {
    stdio: [0, 1, 2],
    cwd: process.cwd()
});

import { Refresh } from './manager/expireManager.js';
import config from './method/getConfigData.js';
import loadRoutes from './routesManager.js';

import express from 'express';
import { logger } from 'ihorizon-tools';
import { initializeDatabase } from './method/database.js';

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.text());

setInterval(() => {
    console.log("[Refresher] Refresh all OWNIHRZ inside this cluster...");
    Refresh();
}, 70000);

loadRoutes(app);

app.listen(config?.cluster.port, async () => {
    await initializeDatabase();
    logger.log(`🚀 >> API listening on :${config?.cluster.port}`)
});

process
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
    })
    .on('uncaughtException', err => {
        console.error(err, 'Uncaught Exception thrown');
    });