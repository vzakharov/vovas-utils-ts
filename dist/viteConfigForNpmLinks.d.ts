export declare function viteConfigForNpmLinks(): IViteConfig;
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
