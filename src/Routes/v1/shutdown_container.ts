import { validateAdminKey } from '../../method/validateData.js';
import isContainerOn from '../../method/getContainerStatus.js';
import config from '../../method/getConfigData.js';
import { Request, Response } from 'express';
import { execSync } from "child_process";
import path from "node:path";
import fs from "node:fs";
import { db } from '../../method/database.js';
import { getOwnerByCode } from '../../method/getOwnerByCode.js';

export default {
    type: 'get',
    apiPath: '/api/v1/instance/shutdown/:bot_id/:force/:admin_key',
    run: async (req: Request, res: Response) => {
        const ownihrz_table = db.table("OWNIHRZ");
        const botId = req.params["bot_id"];
        const adminKey = req.params["admin_key"];
        const force = req.params["force"] === "true";

        try {
            if (!config?.api.apiToken) {
                console.log("Error: Failed to load config");
                return res.status(500).send("Failed to load config");
            }

            if (!validateAdminKey(adminKey)) {
                console.log("[Delete] Erreur admin_key n'est pas valide!");
                return res.status(403).send("Invalid admin_key!");
            }

            const botPath = path.join(process.cwd(), 'ownihrz', botId);
            if (!fs.existsSync(botPath)) {
                console.log("[Delete] Erreur bot_id n'existe pas!");
                return res.status(403).send("Invalid bot_id!");
            }

            if (await isContainerOn(botId)) {
                const shutdownCommands = [
                    { line: `pm2 stop ${botId} -f`, cwd: process.cwd() },
                    { line: `pm2 delete ${botId}`, cwd: process.cwd() }
                ];

                const shutdownPromises = shutdownCommands.map(async (cmd) => {
                    try {
                        execSync(cmd.line, { stdio: [0, 1, 2], cwd: cmd.cwd });
                        console.log(`Successfully executed: ${cmd.line}`);
                    } catch (e: any) {
                        console.error(`Error executing ${cmd.line}:`, e.toString().split('\n')[0]);
                    }
                });

                await Promise.all(shutdownPromises);
            } else {
                console.log(`[Shutdown] Container ${botId} already stopped`);
            }

            if (force) {
                const ownerid1 = getOwnerByCode(await ownihrz_table.get("CLUSTER"), botId);
                await ownihrz_table.set(`CLUSTER.${ownerid1}.${botId}.PowerOff`, true);
                console.log(`Force shutdown flag set for bot ${botId}`);
            }

            return res.sendStatus(200);
        } catch (error) {
            console.error(`Shutdown error for bot ${botId}:`, error);
            return res.status(500).send(`Shutdown failed for bot ${botId}`);
        }
    },
};