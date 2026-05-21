import { ALREADY_RESOLVED_PROMISE } from '@integration-components/utils';

export const waitForTicks = async (ticks = 1) => {
    for (let i = 0; i < ticks; i++) await ALREADY_RESOLVED_PROMISE;
};
