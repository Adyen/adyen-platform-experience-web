import logEvent from '../Services/analytics/log-event';
import postTelemetry from '../Services/analytics/post-telemetry';
import collectId from '../Services/analytics/collect-id';
import EventsQueue from './EventsQueue';
import { CoreOptions } from '../types';

class Analytics {
    private static defaultProps = {
        enabled: true,
        telemetry: true,
        checkoutAttemptId: null,
        experiments: [],
    };

    public checkoutAttemptId: string | undefined = undefined;
    public props;
    private readonly logEvent;
    private readonly logTelemetry;
    private readonly queue = new EventsQueue();
    public readonly collectId;

    constructor({ loadingContext, locale, clientKey, analytics }: CoreOptions) {
        this.props = { ...Analytics.defaultProps, ...analytics };
        this.logEvent = logEvent({ loadingContext, locale });
        this.logTelemetry = postTelemetry({ loadingContext, locale, clientKey });
        this.collectId = collectId({ loadingContext: loadingContext ?? '', clientKey: clientKey ?? '', experiments: this.props.experiments });

        const { telemetry, enabled } = this.props;
        if (telemetry === true && enabled === true) {
            if (this.props.checkoutAttemptId) {
                // handle prefilled checkoutAttemptId
                this.checkoutAttemptId = this.props.checkoutAttemptId;
                if (this.checkoutAttemptId) this.queue.run(this.checkoutAttemptId);
            }
        }
    }

    send(event: Record<string, any>) {
        const { enabled, payload, telemetry } = this.props;

        if (enabled === true) {
            if (telemetry === true && !this.checkoutAttemptId) {
                // fetch a new checkoutAttemptId if none is already available
                this.collectId().then(checkoutAttemptId => {
                    this.checkoutAttemptId = checkoutAttemptId;
                    if (this.checkoutAttemptId) this.queue.run(this.checkoutAttemptId);
                });
            }

            if (telemetry === true) {
                const telemetryTask = (checkoutAttemptId: string) =>
                    this.logTelemetry({ ...event, ...(payload && { ...payload }), checkoutAttemptId }).catch(() => {});

                this.queue.add(telemetryTask);

                if (this.checkoutAttemptId) {
                    this.queue.run(this.checkoutAttemptId);
                }
            }

            // Log pixel
            this.logEvent(event);
        }
    }
}

export default Analytics;
