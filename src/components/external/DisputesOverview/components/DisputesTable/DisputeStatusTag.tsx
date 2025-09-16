import { useMemo } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { DISPUTE_STATUSES } from '../../../../utils/disputes/constants';
import { IDispute, IDisputeListItem } from '../../../../../types/api/models/disputes';
import { isDisputeActionNeededUrgently } from '../../../../utils/disputes/actionNeeded';
import { Tag } from '../../../../internal/Tag/Tag';
import { TagVariant } from '../../../../internal/Tag/types';
import { PropsWithChildren } from 'preact/compat';

const DisputeStatusTag = ({ dispute }: PropsWithChildren<{ dispute: IDisputeListItem | IDispute }>) => {
    const { i18n } = useCoreContext();
    const disputeStatus = useMemo(() => i18n.get(DISPUTE_STATUSES[dispute.status]), [i18n, dispute]);

    const variant = useMemo<TagVariant>(() => {
        if (dispute.status === 'WON') return TagVariant.SUCCESS;
        if ((dispute as any)?.defensibility === 'NOT_ACTIONABLE') return TagVariant.DEFAULT;
        if (isDisputeActionNeededUrgently(dispute)) return TagVariant.ERROR;
        return TagVariant.DEFAULT;
    }, [dispute]);

    return <Tag variant={variant} label={disputeStatus} />;
};

export default DisputeStatusTag;
