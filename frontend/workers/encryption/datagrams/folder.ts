import {
    createEntityDatagram,
    createSerializer,
} from '~/workers/encryption/datagrams/datagram';
import { IFolder } from '~/@types';
import { EncryptionDatagramType } from '~/workers/encryption/constants';

export const encryptedProperties: (keyof IFolder)[] = ['name'];
export const FolderDatagram = createEntityDatagram<IFolder>(
    EncryptionDatagramType.FOLDER,
    createSerializer<IFolder>(encryptedProperties),
);
