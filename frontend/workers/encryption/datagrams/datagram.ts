import { createRawCompressedJSONDatagram } from '@skiff-org/skiff-crypto';
import { SemVer } from 'semver';
import { EncryptionDatagramType } from '~/workers/encryption/constants';

export interface DatagramSerializer<T> {
    serialize(data: T): Partial<T> & Record<string, any>;
    deserialize(data: Partial<T> & Record<string, any>): T;
}

export const createRawSerializer = <T>(): DatagramSerializer<T> => {
    return {
        serialize: data => data as Partial<T>,
        deserialize: data => data as T,
    };
};

export const createSerializer = <T>(
    properties: (keyof T)[],
): DatagramSerializer<T> => {
    return {
        serialize: data => {
            return properties.reduce((acc, key) => {
                acc[key] = data[key];
                return acc;
            }, {} as any);
        },
        deserialize: data => data as T,
    };
};

export const createEntityDatagram = <T>(
    entity: EncryptionDatagramType,
    serialiazer: DatagramSerializer<T>,
) => {
    const rawDatagram = createRawCompressedJSONDatagram<Partial<T>>(
        entity,
        '1.0.0',
        /1.0.*/ as any,
    );

    return {
        ...rawDatagram,
        serialize: (data: T) => {
            return rawDatagram.serialize(serialiazer.serialize(data));
        },
        deserialize: (data: Uint8Array) => {
            return serialiazer.deserialize(
                rawDatagram.deserialize(data, rawDatagram.version),
            );
        },
    };
};
