import {
    createEntityDatagram,
    createRawSerializer,
} from '~/workers/encryption/datagrams/datagram';
import { EncryptionDatagramType } from '~/workers/encryption/constants';
import { IntegrationConfig } from '~/workers/integrations/base';

export const IntegrationDatagram = createEntityDatagram<
    IntegrationConfig<any>['data']
>(
    EncryptionDatagramType.INTEGRATION,
    createRawSerializer<IntegrationConfig<any>['data']>(),
);
