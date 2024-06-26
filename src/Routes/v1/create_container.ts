import { Custom_iHorizon } from '../../../types/OwnihrzData';
import { validateData } from '../../method/validateData.js';
import config from '../../method/getConfigData.js';
import db from '../../method/database.js';

import { Request, Response } from 'express';
import { mkdir } from "node:fs/promises";
import { execSync } from "child_process";
import path from "node:path";

export default {
    type: 'post',
    apiPath: '/api/v1/instance/create',
    run: async (req: Request, res: Response) => {

        const data = req.body as Custom_iHorizon;

        if (!config?.api.apiToken) {
            console.log("Error: Failed to load config");
            return res.status(500).send("Failed to load config");
        }

        if (!validateData(data)) {
            console.log("Error: Invalid Data");
            return res.status(403).send("Invalid Data");
        }

        await mkdir(`${process.cwd()}/ownihrz/${data.Code}`, { recursive: true });

        let port_range = 29268;

        [
            {
                l: `git clone --branch ${config.container.branchName} --depth 1 ${config.container.githubRepo} .`,
                cwd: path.resolve(process.cwd(), 'ownihrz', data.Code)
            },

            {
                l: `bun install`,
                cwd: path.resolve(process.cwd(), 'ownihrz', data.Code)
            },

            {
                l: 'cp src/files/config.example.ts src/files/config.ts',
                cwd: path.resolve(process.cwd(), 'ownihrz', data.Code)
            },

            // The bot token
            {
                l: `sed -i 's/token: "The bot token"/token: "${data.Auth}"/' config.ts`,
                cwd: path.resolve(process.cwd(), 'ownihrz', data.Code, 'src', 'files')
            },

            // Owner1
            {
                l: `sed -i 's/ownerid1: "User id",/ownerid1: "${data.OwnerOne}",/' config.ts`,
                cwd: path.resolve(process.cwd(), 'ownihrz', data.Code, 'src', 'files')
            },

            // Owner2
            {
                l: `sed -i 's/ownerid2: "User id",/ownerid2: "${data.OwnerTwo}",/' config.ts`,
                cwd: path.resolve(process.cwd(), 'ownihrz', data.Code, 'src', 'files'),
            },

            // ApiToken
            {
                l: `sed -i 's/apiToken: "The api token",/apiToken: "${config.api.apiToken}",/' config.ts`,
                cwd: path.resolve(process.cwd(), 'ownihrz', data.Code, 'src', 'files')
            },

            // Blacklist
            {
                l: `sed -i 's/blacklistPictureInEmbed: "An png url",/blacklistPictureInEmbed: "https:\\/\\/ihorizon\\.me\\/assets\\/img\\/bot\\/bsod\\.png",/' config.ts`,
                cwd: path.resolve(process.cwd(), 'ownihrz', data.Code, 'src', 'files')
            },

            // Lavalink Host URL
            {
                l: `sed -i 's/host: "lavalink.example.com"/host: "${data.Lavalink.NodeHost}"/' config.ts`,
                cwd: path.resolve(process.cwd(), 'ownihrz', data.Code, 'src', 'files')
            },

            // Lavalink Authorization
            {
                l: `sed -i 's/authorization: "password"/authorization: "${data.Lavalink.NodeAuth}"/' config.ts`,
                cwd: path.resolve(process.cwd(), 'ownihrz', data.Code, 'src', 'files')
            },

            // Lavalink Node Port
            {
                l: `sed -i 's/port: 2333/port: ${data.Lavalink.NodePort}/' config.ts`,
                cwd: path.resolve(process.cwd(), 'ownihrz', data.Code, 'src', 'files')
            },

            // Compile
            {
                l: 'bun x tsc',
                cwd: path.resolve(process.cwd(), 'ownihrz', data.Code)
            },

            // Move file
            {
                l: `mv dist/index.js dist/${data.Code}.js`,
                cwd: path.resolve(process.cwd(), 'ownihrz', data.Code)
            },

            // Start
            {
                l: `pm2 start ./dist/${data.Code}.js -f`,
                cwd: path.resolve(process.cwd(), 'ownihrz', data.Code)
            }
        ].forEach((index) => {
            try {
                execSync(index.l, { stdio: [0, 1, 2], cwd: index.cwd });
            } catch (e: any) {
                console.log(e.toString().split('\n')[0]);
            }
        });

        let table = db.table(`OWNIHRZ`);

        await table.set(`CLUSTER.${data.OwnerOne}.${data.Code}`,
            {
                Path: (path.resolve(process.cwd(), 'ownihrz', data.Code)) as string,
                Auth: data.Auth,
                OwnerOne: data.OwnerOne,
                OwnerTwo: data.OwnerTwo,
                Cluster: config.cluster.id,
                ExpireIn: data.ExpireIn,
                Bot: data.Bot,
                Code: data.Code
            }
        );

        res.status(200).send("CREATE !");
    },
};