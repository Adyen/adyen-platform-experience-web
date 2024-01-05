import createRangeTimestampsFactory from '../factory';
import { startOfMonth } from '../utils';

const lastMonth = createRangeTimestampsFactory({
    from(context) {
        return startOfMonth(new Date(this.to(context)));
    },
    to: ({ now }) => startOfMonth(new Date(now)) - 1,
});

export default lastMonth;
