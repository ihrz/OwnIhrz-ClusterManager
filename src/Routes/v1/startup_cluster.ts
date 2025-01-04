import { validateAdminKey } from '../../method/validateData.js';
import isContainerOn from '../../method/getContainerStatus.js';
import config from '../../method/getConfigData.js';
import { Request, Response } from 'express';
import { exec } from "child_process";
import path from "node:path";
import fs from "node:fs";
import { db } from '../../method/database.js';
import util from 'util';

const execPromise = util.promisify(exec);

// Helper function to execute command with Promise
const executeCommand = async (command: string, cwd: string, botId: string): Promise<void> => {
    try {
        await execPromise(command, { cwd });
    } catch (error: any) {
        console.error(`Error executing command "${command}" for bot ${botId}:`, error.toString().split('\n')[0]);
    }
};

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
        }

        try {
            const table_1 = db.table("OWNIHRZ");
            const allOwners = await table_1.all();
            const startupPromises: Promise<void>[] = [];

            allOwners.forEach(owner_one => {
                const cluster_ownihrz = owner_one.value;

                for (let owner_id in cluster_ownihrz) {
                    for (let bot_id in cluster_ownihrz[owner_id]) {
                        if (
                            cluster_ownihrz[owner_id][bot_id].ExpireIn <= Date.now() ||
                            !cluster_ownihrz[owner_id][bot_id].Code
                        ) {
                            continue;
                        }

                        const botId = cluster_ownihrz[owner_id][bot_id].Code;
                        const startupPromise = (async () => {
                            const botPath = path.join(process.cwd(), 'ownihrz', botId);

                            if (!fs.existsSync(botPath)) {
                                console.log(`[Delete] Erreur bot_id ${botId} n'existe pas!`);
                                return;
                            }

                            if (await isContainerOn(botId)) {
                                console.log(`[Startup] Container ${botId} already running`);
                                return;
                            }

                            const commands = [
                                { line: 'rm -r -f dist', cwd: botPath },
                                { line: 'git pull', cwd: botPath },
                                { line: "bun install", cwd: botPath },
                                { line: `npx tsc`, cwd: botPath },
                                { line: `mv dist/index.js dist/${botId}.js`, cwd: botPath },
                                { line: `pm2 start dist/${botId}.js -f`, cwd: botPath }
                            ];

                            // Execute commands in sequence for each bot, but allow multiple bots to process in parallel
                            for (const cmd of commands) {
                                await executeCommand(cmd.line, cmd.cwd, botId);
                            }

                            console.log(`[Startup] Container ${botId} started successfully`.green);
                        })();

                        startupPromises.push(startupPromise);
                    }
                }
            });

            await Promise.all(startupPromises);
            return res.sendStatus(200);

        } catch (error) {
            console.error("Cluster startup error:", error);
            return res.status(500).send("Cluster startup failed");
        }
    },
};