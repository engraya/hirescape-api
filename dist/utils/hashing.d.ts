export declare const doHash: (value: string, saltValue: number) => Promise<string>;
export declare const doHashValidation: (value: string, hashedValue: string) => Promise<boolean>;
export declare const hmacProcess: (value: string | Buffer, key: string | Buffer) => string;
