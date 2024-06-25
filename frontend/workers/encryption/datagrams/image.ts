import {
    createEntityDatagram,
    createSerializer,
} from '~/workers/encryption/datagrams/datagram';
import { ImageObject } from '~/@types';
import { EncryptionDatagramType } from '~/workers/encryption/constants';

export const imageObjectEncryptedProperties: (keyof ImageObject)[] = ['name'];
export const ImageObjectDatagram = createEntityDatagram<ImageObject>(
    EncryptionDatagramType.IMAGE_OBJECT,
    createSerializer<ImageObject>(imageObjectEncryptedProperties),
);

export const imageEncryptedProperties: (keyof ImageObject)[] = ['data'];

export const ImageDatagram = createEntityDatagram<ImageObject>(
    EncryptionDatagramType.IMAGE_DATA,
    createSerializer<ImageObject>(imageEncryptedProperties),
);
