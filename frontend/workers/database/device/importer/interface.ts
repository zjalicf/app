export type ImporterOptions = {};

export interface Importer {
    importUsingFilepath(
        filepath: string,
        options?: Partial<ImporterOptions>,
    ): Promise<void>;
    importUsingContent(
        vaultId: string,
        content: string,
        options?: ImporterOptions,
    ): Promise<void>;
}
