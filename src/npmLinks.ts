import _ from "lodash";
import yaml from "js-yaml";
import path from "path";
import childProcess from "child_process";
import { logger } from "./logger";

const log = logger('vovas-utils.npmLinks', 'yellow');

export interface INpmLsOutput {
  dependencies: Record<string, {
    resolved?: string;
  }>
}

export type NpmLink = [string, string];

export function getNpmLinks(): NpmLink[] {
  const npmLsOutput: INpmLsOutput = JSON.parse(
    childProcess.execSync("npm ls --depth=0 --link=true --json=true").toString()
  );
  log("npmLsOutput:\n", npmLsOutput);

  // We need to remove `file:` prefix from the resolved path
  const npmLinks = Object.entries(
    _.mapValues(
      npmLsOutput.dependencies,
      (dependency) => dependency.resolved?.replace(/^file:/, "") ?? ""
    )
  ).filter(([_, resolvedPath]) => resolvedPath);
  return npmLinks;
}

export function viteConfigForNpmLinks(): IViteConfig {

  // First, let's get all npm-linked packages
  // npm ls --depth=0 --link=true --json=true
  const npmLinks = getNpmLinks();

  log("npmLinks:\n", npmLinks);

  const viteConfig = npmLinks.reduce( (vite: IViteConfig, packageName) => {
    log("Adding alias for", packageName, "to vite config");
    const [ alias, relativePath ] = Array.isArray(packageName) ? packageName : [ packageName, packageName ];
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
    })
    log.green("Resulting vite config:", vite);
    return toMerge;
  }, {});

  return viteConfig;

}

export interface IViteConfig {
  resolve?: {
    alias: Record<string, string>;
  };
  server?: {
    fs: {
      allow: string[];
    };
  };
}

export function forceUpdateNpmLinks() {
  // Run `yarn add --force [packageName]` for each npm-linked package
  getNpmLinks().forEach(([packageName]) => {
    log(`Forcing update of npm-linked package ${packageName}`);
    childProcess.execSync(`yarn add --force ${packageName}`);
    log.green(`Successfully updated npm-linked package ${packageName}`);
  });
}
