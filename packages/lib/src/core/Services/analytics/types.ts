import { Experiment } from '../../Analytics/types';

type CheckoutAttemptIdSession = {
    id: string;
    timestamp: number;
};

type CollectIdProps = {
    clientKey: string;
    loadingContext: string;
    experiments: Experiment[];
};

type LogConfig = { locale?: string; loadingContext?: string; clientKey?: string };

export { CheckoutAttemptIdSession, CollectIdProps, LogConfig };
