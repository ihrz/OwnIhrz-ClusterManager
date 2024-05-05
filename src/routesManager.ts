import { Express } from "express-serve-static-core";
import { opendir } from "fs/promises";
import jsPath from "node:path";

import { EltType } from "../types/elt";

async function buildDirectoryTree(path: string): Promise<(string | object)[]> {
    let result = [];
    let dir = await opendir(path);
    for await (let dirent of dir) {
        if (dirent.isDirectory()) {
            result.push({ name: dirent.name, sub: await buildDirectoryTree(jsPath.join(path, dirent.name)) });
        } else {
            result.push(dirent.name);
        };
    }
    return result;
};

function buildPaths(basePath: string, directoryTree: (string | object)[]): string[] {
    let paths = [];
    for (let elt of directoryTree) {
        switch (typeof elt) {
            case "object":
                for (let subElt of buildPaths((elt as EltType).name, (elt as EltType).sub)) {
                    paths.push(jsPath.join(basePath, subElt));
                }
                break;
            case "string":
                paths.push(jsPath.join(basePath, elt));
                break;
            default:
                throw new Error('Invalid element type');
        }
    }
    return paths;
};

async function loadRoutes(app: Express, path: string = `${process.cwd()}/dist/Routes/`): Promise<void> {

    let directoryTree = await buildDirectoryTree(path);
    let paths = buildPaths(path, directoryTree);

    var i = 0;
    for (let path of paths) {
        if (!path.endsWith('.js')) return;

        let Routes = await import(path).then(data => data.default);

        if (Routes?.type === 'get') {
            app.get(Routes.apiPath, Routes.run);
            i++;

        } else if (Routes?.type === 'post') {
            app.post(Routes.apiPath, Routes.run);
            i++;

        };
    };

    console.log(`🚀 >> Loaded ${i} Routes for the API.`);
};

export default loadRoutes;