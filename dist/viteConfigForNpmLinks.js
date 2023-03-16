import _ from "lodash";
import yaml from "js-yaml";
import path from "path";
import { execSync } from "child_process";
import { logger } from "./logger.js";
const log = logger(20, 'yellow');
export function viteConfigForNpmLinks() {
    const npmLinks = Object.entries(yaml.load(execSync('ls -l node_modules | grep ^l | awk \'{print $9": "$11}\'')
        .toString()
        .trim()));
    const viteConfig = npmLinks.reduce((vite, packageName) => {
        log("Adding alias for", packageName, "to vite config");
        const [alias, relativePath] = Array.isArray(packageName) ? packageName : [packageName, packageName];
        const resolvedPath = path.resolve(__dirname, `${relativePath}/src`);
        const toMerge = _.merge(vite, {
            resolve: {
                alias: {
                    [alias]: resolvedPath,
                },
            },
            // Allow vite to access files outside of the project root
            server: {
                fs: {
                    allow: [
                        ...vite.server?.fs?.allow ?? [],
                        resolvedPath,
                    ],
                },
            }
        });
        log.green("Resulting vite config:", vite);
        return toMerge;
    }, {});
    return viteConfig;
}
