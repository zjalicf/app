import { ServiceKey } from '~/constants';

export class LocalImageService {
    serviceRegistry: any;
    constructor(serviceRegistry: any) {
        this.serviceRegistry = serviceRegistry;
    }

    async save(documentId: string, image: Blob) {
        return await this.serviceRegistry.invoke(
            ServiceKey.DATABASE,
            'images:save',
            {
                payload: {
                    documentId,
                    image,
                },
                callerContext: 'local-image-service.ts save',
            },
        );
    }
}
