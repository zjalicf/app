import {
    createEntityDatagram,
    createSerializer,
} from '~/workers/encryption/datagrams/datagram';
import { EncryptionDatagramType } from '~/workers/encryption/constants';
import { IView } from '~/components/view/model';

export const encryptedProperties: (keyof IView)[] = ['name', 'definition'];
export const ViewDatagram = createEntityDatagram<IView>(
    EncryptionDatagramType.VIEW,
    createSerializer<IView>(encryptedProperties),
);
