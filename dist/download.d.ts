/// <reference types="node" />
import fs from 'fs';
export declare function download(url: string, filename?: string): Promise<string>;
export declare function downloadAsStream(url: string): Promise<fs.ReadStream>;
