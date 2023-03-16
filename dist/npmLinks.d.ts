export interface INpmLsOutput {
    dependencies: Record<string, {
        resolved?: string;
    }>;
}
export type NpmLink = [string, string];
export declare function getNpmLinks(): NpmLink[];
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
export declare function forceUpdateNpmLinks(): void;
