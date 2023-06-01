import fs from 'fs';
import https from 'https';
import path from 'path';
import os from 'os';
import { Resolvable } from './resolvable';
import _ from 'lodash';
import { logger } from './logger';

const log = logger("vovas-utils.download");

export async function download(url: string, release: Resolvable, filename?: string): Promise<string> {
  const basename = path.basename(url);
  const [ name, extension ] = basename.match(/(.*)\.([^.]*)$/)?.slice(1) ?? [];
  const filePath = path.join(os.tmpdir(), filename ?? [ _.uniqueId(name+'_'), extension ].join('.'));
  const file = fs.createWriteStream(filePath);
  const request = https.get(url, response => response.pipe(file));
  await new Promise((resolve, reject) => {
    file.on('finish', resolve);
    [ file, request ].forEach(stream => stream.on('error', reject));
  });
  // Log the size
  log.green(`Downloaded ${url} to ${filePath} (${fs.statSync(filePath).size} bytes)`);
  release.promise.then(() =>
    fs.rm(filePath, () => log.magenta(`Deleted ${filePath}`))
  );
  return filePath;
}

export async function downloadAsStream(url: string, release: Resolvable): Promise<fs.ReadStream> {
  const path = await download(url, release);
  return fs.createReadStream(path);
}