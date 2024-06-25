export class FilepathStorage {
    private filepathToEntity: Record<string, Map<string, string>> = {};

    set(vaultId: string, filepath: string, id: string): void {
        if (!this.filepathToEntity[vaultId]) {
            this.filepathToEntity[vaultId] = new Map();
        }
        this.filepathToEntity[vaultId].set(filepath, id);
    }

    get(vaultId: string, filepath: string): string | undefined {
        return this.filepathToEntity[vaultId]?.get(filepath);
    }

    getAvailable(vaultId: string, filepath: string, id: string): string {
        const filepathBase = filepath.replace(/\.md$/, '');
        let i = 1;
        let newFilepath = filepath + '.md';
        const isAvailable = () => {
            const entityId = this.get(vaultId, newFilepath);
            return entityId === undefined || entityId === id;
        };
        while (!isAvailable()) {
            newFilepath = `${filepathBase} ${i}.md`;
            i++;
        }
        return newFilepath;
    }
}
