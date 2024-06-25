import {
    createEntityDatagram,
    createSerializer,
} from '~/workers/encryption/datagrams/datagram';
import { IDocument } from '~/components/document/model';
import { EncryptionDatagramType } from '~/workers/encryption/constants';

export const encryptedProperties: (keyof IDocument)[] = [
    'content',
    'title',
    'start',
    'end',
    'mdContent',
    'clip',
];

export const DocumentDatagram = createEntityDatagram<IDocument>(
    EncryptionDatagramType.DOCUMENT,
    createSerializer<IDocument>(encryptedProperties),
);
