export const resolvePlatform = (
    platformComponents: Record<string, () => any>,
): (() => Promise<any>) => {
    const platform = process.env.platform as string;

    if (!Object.keys(platformComponents).includes(platform)) {
        return platformComponents.default;
    }

    return platformComponents[platform];
};
