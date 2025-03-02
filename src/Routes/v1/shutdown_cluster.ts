import { validateAdminKey } from '../../method/validateData.js';
import isContainerOn from '../../method/getContainerStatus.js';
import config from '../../method/getConfigData.js';

import { Request, Response } from 'express';
import { execSync } from "child_process";
import path from "node:path";
import fs from "node:fs";
import { db } from '../../method/database.js';
import logsRequest from '../../method/logRequest.js';

export const route = {
    type: 'post',
    apiPath: '/api/v1/instance/shutdown_cluster',
    run: async (req: Request, res: Response) => {
        logsRequest(route, req);

        const { adminKey } = req.body;

        if (!config?.api.apiToken) {
            console.log("Error: Failed to load config");
            return res.status(500).send("Failed to load config");
        }

        if (!validateAdminKey(adminKey)) {
            console.log("[Delete] Erreur admin_key n'est pas valide!");
            return res.status(403).send("Invalid admin_key!");
        };


        var table_1 = db.table("OWNIHRZ");
        let ownihrzClusterData = await table_1.get("CLUSTER");

        for (let userId in ownihrzClusterData as any) {
            for (let botId in ownihrzClusterData[userId]) {
                if (ownihrzClusterData[userId][botId].PowerOff || !ownihrzClusterData[userId][botId].Code) continue;
                let bot_id = ownihrzClusterData[userId][botId].Code;

                if (!fs.existsSync(path.join(process.cwd(), 'ownihrz', bot_id))) {
                    console.log("[Delete] Erreur bot_id n'existe pas!");
                    return res.status(403).send("Invalid bot_id!");
                };

                if (await isContainerOn(botId)) {
                    [
                        {
                            line: `pm2 stop ${botId} -f`,
                            cwd: process.cwd(),
                        },
                        {
                            line: `pm2 delete ${botId}`,
                            cwd: process.cwd(),
                        },
                    ].forEach((index) => {
                        try {
                            execSync(index.line, { stdio: [0, 1, 2], cwd: index.cwd });
                        } catch (e: any) {
                            console.log(e.toString().split('\n')[0]);
                        }
                    });
                } else {
                    console.log('[Startup] Erreur tentative doublon!');
                }

            }
        };

        return res.sendStatus(200);
    },
};