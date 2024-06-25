import { Context } from '@nuxt/types';
import { saveAs } from 'file-saver';
import { SafeElectronWindow } from '~/@types';
import { blobToBuffer, serializeImage, stringToBuffer } from '~/helpers/image';

export class FileSystemUtils {
    private context: Context;

    constructor(ctx: Context) {
        this.context = ctx;
    }

    async saveAs(data: Blob | string, filename: string): Promise<boolean> {
        try {
            if (this.context.$config.platform === 'desktop') {
                const { electron } = window as SafeElectronWindow;
                if (!electron) return false;

                let buffer: Buffer | null = null;
                let type: 'string' | 'blob' = 'string';

                if (typeof data === 'string') {
                    type = 'string';
                    buffer = stringToBuffer(data);
                } else if (data instanceof Blob) {
                    type = 'blob';
                    buffer = await blobToBuffer(data);
                } else {
                    return false;
                }

                const serializedBuffer = serializeImage(buffer);

                return await electron.saveAs(serializedBuffer, filename, type);
            }

            saveAs(data, filename);
            return true;
        } catch (e) {
            return false;
        }
    }

    getOSArch(): string | null {
        if (this.context.$config.platform === 'desktop') {
            return (window as SafeElectronWindow).electron.getOSArch();
        }

        return this.context.$config.os;
    }
}
