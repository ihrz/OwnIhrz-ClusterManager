import { validateAdminKey } from '../../method/validateData.js';
import isContainerOn from '../../method/getContainerStatus.js';
import config from '../../method/getConfigData.js';

import { Request, Response } from 'express';
import { execSync } from "child_process";
import path from "node:path";
import fs from "node:fs";
import { db } from '../../method/database.js';

export default {
    type: 'post',
    apiPath: '/api/v1/instance/startup_cluster',
    run: async (req: Request, res: Response) => {

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

        (await table_1.all()).forEach(async owner_one => {
            var cluster_ownihrz = owner_one.value;

            for (let owner_id in cluster_ownihrz) {
                for (let bot_id in cluster_ownihrz[owner_id]) {
                    if (cluster_ownihrz[owner_id][bot_id].ExpireIn <= Date.now() || !cluster_ownihrz[owner_id][bot_id].Code) continue;
                    let botId = cluster_ownihrz[owner_id][bot_id].Code;

                    if (!fs.existsSync(path.join(process.cwd(), 'ownihrz', botId))) {
                        console.log("[Delete] Erreur bot_id n'existe pas!");
                        return res.status(403).send("Invalid bot_id!");
                    };

                    if (!await isContainerOn(botId)) {
                        [
                            {
                                line: 'rm -r -f dist',
                                cwd: path.join(process.cwd(), 'ownihrz', botId)
                            },
                            {
                                line: 'git pull',
                                cwd: path.join(process.cwd(), 'ownihrz', botId)
                            },
                            {
                                line: "bun install",
                                cwd: path.join(process.cwd(), 'ownihrz', botId),
                            },
                            {
                                line: `npx tsc`,
                                cwd: path.join(process.cwd(), 'ownihrz', botId)
                            },
                            {
                                line: `mv dist/index.js dist/${botId}.js`,
                                cwd: path.join(process.cwd(), 'ownihrz', botId)
                            },
                            {
                                line: `pm2 start dist/${botId}.js -f`,
                                cwd: path.join(process.cwd(), 'ownihrz', botId)
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
        })

        return res.sendStatus(200);
    },
};