import _ from "lodash";
import path from "path";
import { execSync } from "child_process";
import { logger } from "./logger.js";
const log = logger(20, 'yellow');
export function viteConfigForNpmLinks() {
    // First, let's get all npm-linked packages
    // npm ls --depth=0 --link=true --json=true
    const npmLsOutput = JSON.parse(execSync("npm ls --depth=0 --link=true --json=true").toString());
    // We need to remove `file:` prefix from the resolved path
    const npmLinks = Object.entries(_.mapValues(npmLsOutput.dependencies, ({ resolved }) => resolved.replace(/^file:/, '')));
    log("npmLinks:\n", npmLinks);
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
