import { ConfigType } from "../../types/config";
import { readFileSync } from "node:fs";
import path from "node:path";

import yaml from 'js-yaml';

var CONFIG_CACHE: ConfigType;
const PATH = path.join(process.cwd(), "config.yaml");

function getConfigData(): ConfigType | undefined {
    try {
        if (CONFIG_CACHE) {
            return CONFIG_CACHE;
        }

        const file = yaml.load(readFileSync(PATH, 'utf8')) as ConfigType;

        CONFIG_CACHE = file;

        return CONFIG_CACHE;
    } catch (err) {
        return undefined;
    }
};

export default getConfigData();