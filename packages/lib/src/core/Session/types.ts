export type SessionResponse = {
    id: string;
    token: string;
};

export type SessionSetupResponse = {
    endpoints: Record<string, { method: string; url: string }>;
};
