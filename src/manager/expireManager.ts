import config from "../method/getConfigData.js";
import db from "../method/database.js";

import { execSync } from "child_process";

const clusterKey = `cluster${config?.cluster.id}`;

async function Refresh() {
    let table = db.table(clusterKey);
    let result = await table.all();

    let now = new Date().getTime();

    result.forEach((v) => {
        let userId = v.id;
        let botId = v.value;

        console.log(userId, botId)
    });

    // for (let i in result) {
    //     for (let c in result[i]) {
    //         if (!result[i][c].Code || result[i][c].PowerOff) continue;
    //         if (now >= result[i][c].ExpireIn) {
    //             await db.set(`OWNIHRZ.${i}.${c}.PowerOff`, true);

    //             [
    //                 {
    //                     line: `pm2 stop ${result[i][c].Code} -f`,
    //                     cwd: process.cwd()
    //                 },
    //                 {
    //                     line: `pm2 delete ${result[i][c].Code}`,
    //                     cwd: process.cwd()
    //                 },
    //             ].forEach((index) => { execSync(index.line, { stdio: [0, 1, 2], cwd: index.cwd }); });
    //         }
    //     }
    // }

    return;
};

export const refresher = setInterval(() => {
    console.log("[Refresher] Refresh all OWNIHRZ inside this cluster...");
    Refresh();
}, 16000);