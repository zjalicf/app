import type {
    User as LinearUser,
    Organization as LinearOrganization,
} from '@linear/sdk';

export type LinearIntegrationConfig = {
    credentials: {
        accessToken: string;
        expiryDate: number;
    };
    myself: LinearUser;
    organization: LinearOrganization;
    teams: string[];
    views: any[];
};
