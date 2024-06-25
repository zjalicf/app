import {
    createEntityDatagram,
    createSerializer,
} from '~/workers/encryption/datagrams/datagram';
import { EncryptionDatagramType } from '~/workers/encryption/constants';

export const encryptedProperties: (keyof any)[] = ['content'];

export const VersionDatagram = createEntityDatagram<any>(
    EncryptionDatagramType.VERSION,
    createSerializer<any>(encryptedProperties),
);
