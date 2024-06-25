import {
    Datagram,
    encryptSymmetric,
    decryptSymmetric,
    stringEncryptAsymmetric,
    stringDecryptAsymmetric,
} from '@skiff-org/skiff-crypto';
import { EncryptionDatagramType } from '~/workers/encryption/constants';

interface SymmetricEncryption {
    encrypt: (data: any, key: string) => string;
    decrypt: (data: string, key: string) => any;
}

interface AsymmetricEncryption {
    encrypt: (data: string, privateKey: string, publicKey: string) => string;
    decrypt: (data: string, privateKey: string, publicKey: string) => any;
}

export const utf8BytesToString = (data: Uint8Array) => {
    const utf8decoder = new TextDecoder();
    return utf8decoder.decode(data);
};

export const utf8StringToBytes = (data: string) => {
    const utf8encoder = new TextEncoder();
    return utf8encoder.encode(data);
};

class EncryptionFactory {
    private datagrams: Record<string, Datagram<any>> = {};

    registerDatagram(datagram: Datagram<any>) {
        this.datagrams[datagram.type] = datagram;
    }

    private asymmetricEncryption() {
        return {
            encrypt: (data: string, privateKey: string, publicKey: string) => {
                return stringEncryptAsymmetric(
                    privateKey,
                    { key: publicKey },
                    data,
                );
            },
            decrypt: (data: string, privateKey: string, publicKey: string) => {
                return stringDecryptAsymmetric(
                    privateKey,
                    { key: publicKey },
                    data,
                );
            },
        };
    }

    private symmetricEncryption(datagram: Datagram<any>) {
        return {
            encrypt: (data: any, key: string) => {
                return encryptSymmetric(data, key, datagram);
            },
            decrypt: (data: string, key: string) => {
                return decryptSymmetric(data, key, datagram);
            },
        };
    }

    symmetric(storage: EncryptionDatagramType): SymmetricEncryption {
        const datagram = this.datagrams[storage];
        return this.symmetricEncryption(datagram);
    }

    asymmetric(): AsymmetricEncryption {
        return this.asymmetricEncryption();
    }
}

export const encryptionFactory = new EncryptionFactory();
