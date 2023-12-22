export type Session = {
    id: string;
    sessionData: string;
};

export type SessionResponse = {
    id: string;
    token: string;
    refreshToken: string;
};

export type SessionConfiguration = {
    enableStoreDetails: boolean;
};

export type SessionSetupResponse = {
    // id: string;
    // sessionData: string;
    // expiresAt: string;
    // components: any;
    // returnUrl: string;
    // configuration: SessionConfiguration;
    endpoints: Record<string, { method: string; urls: string }>;
};
