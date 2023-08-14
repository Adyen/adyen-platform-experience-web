import type { Verification, Problem } from './verification';

interface Capability {
    enabled?: boolean;
    requested: boolean;
    allowed: boolean;
    problems?: Problem[];
    verificationStatus: Verification;
}

export type Capabilities = { [key: string]: Capability };
