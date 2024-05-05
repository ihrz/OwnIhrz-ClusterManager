import { validateAdminKey } from '../../method/validateData.js';
import isContainerOn from '../../method/getContainerStatus.js';
import config from '../../method/getConfigData.js';

import { Request, Response } from 'express';
import { execSync } from "child_process";
import path from "node:path";
import fs from "node:fs";

export default {
    type: 'get',
    apiPath: '/api/v1/instance/startup/:bot_id/:admin_key/',
    run: async (req: Request, res: Response) => {

        const botId = req.params["bot_id"];
        const adminKey = req.params["admin_key"];

        if (!config?.api.apiToken) {
            console.log("Error: Failed to load config");
            return res.status(500).send("Failed to load config");
        }

        if (!validateAdminKey(adminKey)) {
            console.log("[Delete] Erreur admin_key n'est pas valide!");
            return res.status(403).send("Invalid admin_key!");
        };

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
                } catch (e) {
                    console.log((e as string).split('\n'));
                }
            });
        } else {
            console.log('[Startup] Erreur tentative doublon!');
        }

        return res.sendStatus(200);
    },
};