export type SessionResponse = {
    id: string;
    token: string;
};

export type SessionConfiguration = {
    enableStoreDetails: boolean;
};

export type SessionSetupResponse = {
    endpoints: Record<string, { method: string; urls: string }>;
};
