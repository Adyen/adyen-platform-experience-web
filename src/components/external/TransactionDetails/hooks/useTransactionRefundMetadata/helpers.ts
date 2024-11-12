import type { IRefundStatus } from '../../../../../types';

type _RefundItem = { status: IRefundStatus };

export const checkRefundStatusCollection = <T extends _RefundItem>(predicate: (item: T) => unknown, refundStatusCollection?: T[]) => {
    let every = false;
    let some = false;

    refundStatusCollection?.forEach(item => {
        const passesCheck = !!predicate(item);
        every &&= passesCheck;
        some ||= passesCheck;
    });

    return { every, some } as const;
};
