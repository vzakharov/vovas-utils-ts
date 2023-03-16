import _ from 'lodash';
import path from 'path';
import childProcess from 'child_process';
import { c as logger } from './shared/vovas-utils.1d33c16b.mjs';
import 'fs';
import 'js-yaml';

const log = logger(23, "yellow");
function getNpmLinks() {
  const npmLsOutput = JSON.parse(
    childProcess.execSync("npm ls --depth=0 --link=true --json=true").toString()
  );
  log("npmLsOutput:\n", npmLsOutput);
  const npmLinks = Object.entries(
    _.mapValues(
      npmLsOutput.dependencies,
      (dependency) => dependency.resolved?.replace(/^file:/, "") ?? ""
    )
  ).filter(([_2, resolvedPath]) => resolvedPath);
  return npmLinks;
}
function viteConfigForNpmLinks() {
  const npmLinks = getNpmLinks();
  log("npmLinks:\n", npmLinks);
  const viteConfig = npmLinks.reduce((vite, packageName) => {
    log("Adding alias for", packageName, "to vite config");
    const [alias, relativePath] = Array.isArray(packageName) ? packageName : [packageName, packageName];
    const resolvedPath = path.resolve(__dirname, `${relativePath}/src`);
    const toMerge = _.merge(vite, {
      resolve: {
        alias: {
          [alias]: resolvedPath
        }
      },
      // Allow vite to access files outside of the project root
      server: {
        fs: {
          allow: [
            ...vite.server?.fs?.allow ?? [],
            resolvedPath
          ]
        }
      }
    });
    log.green("Resulting vite config:", vite);
    return toMerge;
  }, {});
  return viteConfig;
}
function forceUpdateNpmLinks() {
  getNpmLinks().forEach(([packageName]) => {
    log(`Forcing update of npm-linked package ${packageName}`);
    childProcess.execSync(`yarn add --force ${packageName}`);
    log.green(`Successfully updated npm-linked package ${packageName}`);
  });
}

export { forceUpdateNpmLinks, getNpmLinks, viteConfigForNpmLinks };
