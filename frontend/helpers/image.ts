export const base64ImageToDataUrl = (imageString: string, type: string) => {
    const prefix = `data:image/${type ?? 'png'};base64,`;
    return prefix + imageString;
};

export const decryptedBytesToBuffer = (
    bytes: Record<number, number>,
): Buffer => {
    return Buffer.from(Object.values<number>(bytes));
};

export const stringToBuffer = (string: string): Buffer => {
    return Buffer.from(string);
};

export const blobToBuffer = async (blob: Blob): Promise<Buffer> => {
    const arrayBuffer = await blob.arrayBuffer();
    return Buffer.from(arrayBuffer);
};

export const bufferToBlob = (buffer: Buffer, type: string = 'png'): Blob => {
    return new Blob([buffer], { type: `image/${type}` });
};

export const serializeImage = (image: Buffer) => {
    return image.toString('base64');
};

export const deserializeImage = (image: string) => {
    return Buffer.from(image, 'base64');
};
