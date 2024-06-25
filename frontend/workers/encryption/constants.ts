export enum EncryptionWorkerActions {
    ENCRYPT_SYMMETRIC = 'encrypt symmetric',
    DECRYPT_SYMMETRIC = 'decrypt symmetric',
    ENCRYPT_SYMMETRIC_BULK = 'encrypt symmetric bulk',
    DECRYPT_SYMMETRIC_BULK = 'decrypt symmetric bulk',
    ENCRYPT_ASYMMETRIC = 'encrypt asymmetric',
    DECRYPT_ASYMMETRIC = 'decrypt asymmetric',
    ENCRYPT_ASYMMETRIC_BULK = 'encrypt asymmetric bulk',
    DECRYPT_ASYMMETRIC_BULK = 'decrypt asymmetric bulk',
}

export enum EncryptionDatagramType {
    // DOCUMENT = 'acreom://datagram/document',
    // FOLDER = 'acreom://datagram/folder',
    // IMAGE_OBJECT = 'acreom://datagram/image-object',
    // IMAGE = 'acreom://datagram/image',
    DOCUMENT = 'datagram:document',
    VIEW = 'datagram:view',
    INTEGRATION = 'datagram:integration',
    FOLDER = 'datagram:folder',
    IMAGE_OBJECT = 'datagram:image-object',
    IMAGE_DATA = 'datagram:image',
    VERSION = 'datagram:version',
    NONE = 'none',
}
