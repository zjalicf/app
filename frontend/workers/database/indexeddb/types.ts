export type IVault = {
    id: string;
    name: string;
    type: 'remote' | 'local';
    filepath?: string;
    oldFilepath?: string;
    privateKeys?: string;
    preferences: {
        myDayTemplateId: string | null;
    };
    createdAt: Date;
    modifiedAt: Date;
};

export type IUser = {
    id: string;
    email: string;
    subscription: {
        customerId: string;
        from: Date;
        status: string;
        subscriptionId: string;
        to: Date;
        type: string;
    };
    active?: boolean;
    credentials?: {
        accessToken: string;
        refreshToken: string;
        expiresAt: number;
    };
    privateKeys?: any;
    passphraseSalt?: string;
    hkdfSalt?: string;
    compatibility: any;
};

export interface SessionData {
    id: string;
    sessionKey: string;
}
