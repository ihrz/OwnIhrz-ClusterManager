import config from "../method/getConfigData.js";
import db from "../method/database.js";

import { execSync } from "child_process";
import path from 'node:path';

async function Refresh() {
    let table = db.table("OWNIHRZ")
    let result = await table.get("CLUSTER");

    let now = new Date().getTime();

    for (let userId in result) {
        for (let botId in result[userId]) {
            if (!result[userId][botId].Code) continue;
            if (result[userId][botId].Cluster !== config?.cluster.id) continue;

            if (now >= result[userId][botId].ExpireIn) {
                if (result[userId][botId].PowerOff) continue;

                await table.set(`CLUSTER.${userId}.${botId}.PowerOff`, true);

                [
                    {
                        line: `pm2 stop ${result[userId][botId].Code} -f`,
                        cwd: process.cwd()
                    },
                    {
                        line: `pm2 delete ${result[userId][botId].Code} -f`,
                        cwd: process.cwd()
                    },
                ].forEach((index) => {
                    try {
                        execSync(index.line, { stdio: [0, 1, 2], cwd: index.cwd });
                    } catch (e: any) {
                        console.log(e.toString().split('\n')[0]);
                    }
                });

            } else if (now <= result[userId][botId].ExpireIn && result[userId][botId].PowerOff) {
                await table.set(`CLUSTER.${userId}.${botId}.PowerOff`, false);

                [
                    {
                        line: `pm2 start ./dist/${result[userId][botId].Code}.js`,
                        cwd: path.join(process.cwd(), 'ownihrz', botId)
                    },
                ].forEach((index) => {
                    try {
                        execSync(index.line, { stdio: [0, 1, 2], cwd: index.cwd });
                    } catch (e: any) {
                        console.log(e.toString().split('\n')[0]);
                    }
                });
            };
        }
    }

    return;
};

export const refresher = setInterval(() => {
    console.log("[Refresher] Refresh all OWNIHRZ inside this cluster...");
    Refresh();
}, 16000);