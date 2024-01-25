import { Experiment } from '../../Analytics/types';

type CheckoutAttemptIdSession = {
    id: string;
    timestamp: number;
};

type CollectIdProps = {
    loadingContext: string;
    experiments: Experiment[];
};

type LogConfig = { locale?: string; loadingContext?: string };

export type { CheckoutAttemptIdSession, CollectIdProps, LogConfig };
