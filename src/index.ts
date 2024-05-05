import { refresher } from './manager/expireManager.js';
import config from './method/getConfigData.js';
import loadRoutes from './routesManager.js';

import express from 'express';
import bp from 'body-parser';

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bp.text());

refresher;
loadRoutes(app);

app.listen(config?.cluster.port, () => {
    console.log(`🚀 >> API listening on :${config?.cluster.port}`)
});

process
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
    })
    .on('uncaughtException', err => {
        console.error(err, 'Uncaught Exception thrown');
    });