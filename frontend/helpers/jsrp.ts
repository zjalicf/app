export const getJsrpClient = async (
    username: string,
    password: string,
): Promise<jsrp.client> => {
    const { client: JSRPClient } = await import('jsrp');

    return new Promise(resolve => {
        const client = new JSRPClient();
        client.init({ username, password }, () => {
            resolve(client);
        });
    });
};

export const getSaltAndVerifier = async (
    username: string,
    password: string,
): Promise<jsrp.Verifier> => {
    const { client: JSRPClient } = await import('jsrp');
    return new Promise((resolve, reject) => {
        const client = new JSRPClient();
        client.init({ username, password }, () => {
            client.createVerifier((err: Error, result: jsrp.Verifier) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    });
};
