import logEvent from '../Services/analytics/log-event';
import postTelemetry from '../Services/analytics/post-telemetry';
import collectId from '../Services/analytics/collect-id';
import { boolOrFalse } from '../../primitives/utils';
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

    constructor({ loadingContext, locale, analytics }: CoreOptions & { loadingContext: string }) {
        this.props = { ...Analytics.defaultProps, ...analytics };
        this.logEvent = logEvent({ loadingContext, locale });
        this.logTelemetry = postTelemetry({ loadingContext, locale });
        this.collectId = collectId({ loadingContext: loadingContext ?? '', experiments: this.props.experiments });

        const { telemetry, enabled } = this.props;
        if (boolOrFalse(telemetry) && boolOrFalse(enabled)) {
            if (this.props.checkoutAttemptId) {
                // handle prefilled checkoutAttemptId
                this.checkoutAttemptId = this.props.checkoutAttemptId;
                if (this.checkoutAttemptId) this.queue.run(this.checkoutAttemptId);
            }
        }
    }

    send(event: Record<string, any>) {
        const { enabled, payload, telemetry } = this.props;

        if (boolOrFalse(enabled)) {
            if (boolOrFalse(telemetry) && !this.checkoutAttemptId) {
                // fetch a new checkoutAttemptId if none is already available
                this.collectId().then(checkoutAttemptId => {
                    this.checkoutAttemptId = checkoutAttemptId;
                    if (this.checkoutAttemptId) this.queue.run(this.checkoutAttemptId);
                });
            }

            if (boolOrFalse(telemetry)) {
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
