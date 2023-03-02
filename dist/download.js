import fs from 'fs';
import https from 'https';
import path from 'path';
import os from 'os';
export default async function download(url, filename) {
    const filePath = path.join(os.tmpdir(), filename ?? path.basename(url));
    const file = fs.createWriteStream(filePath);
    const request = https.get(url, response => response.pipe(file));
    await new Promise((resolve, reject) => {
        file.on('finish', resolve);
        [file, request].forEach(stream => stream.on('error', reject));
    });
    console.log(`Downloaded ${url} to ${filePath}`);
    return filePath;
}
export function downloadAsStream(url) {
    return download(url).then(fs.createReadStream);
}
