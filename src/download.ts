import fs from 'fs';
import https from 'https';
import path from 'path';
import os from 'os';
import { Resolvable } from './resolvable';
import _ from 'lodash';

export async function download(url: string, release: Resolvable, filename?: string): Promise<string> {
  const filePath = path.join(os.tmpdir(), filename ?? _.uniqueId(path.basename(url)));
  const file = fs.createWriteStream(filePath);
  const request = https.get(url, response => response.pipe(file));
  await new Promise((resolve, reject) => {
    file.on('finish', resolve);
    [ file, request ].forEach(stream => stream.on('error', reject));
  });
  console.log(`Downloaded ${url} to ${filePath}`);
  release.promise.then(() => fs.rmSync(filePath));
  return filePath;
}

export function downloadAsStream(url: string, release: Resolvable): Promise<fs.ReadStream> {
  return download(url, release).then(fs.createReadStream);
}