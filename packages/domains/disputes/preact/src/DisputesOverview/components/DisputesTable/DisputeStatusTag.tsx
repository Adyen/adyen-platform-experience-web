import { useMemo } from 'preact/hooks';
import { useCoreContext } from '@integration-components/core/preact';
import { getDisputeStatus, isDisputeActionNeededUrgently } from '@integration-components/disputes/domain';
import { IDispute, IDisputeListItem } from '@integration-components/types/api/models/disputes';
import { Tag } from '@integration-components/ui-components-preact/Tag/Tag';
import { TagVariant } from '@integration-components/ui-components-preact/Tag/types';
import { PropsWithChildren } from 'preact/compat';

const DisputeStatusTag = ({ dispute }: PropsWithChildren<{ dispute: IDisputeListItem | IDispute }>) => {
    const { i18n } = useCoreContext();
    const disputeStatus = useMemo(() => getDisputeStatus(i18n, dispute.status), [i18n, dispute]);

    const variant = useMemo<TagVariant>(() => {
        if (dispute.status === 'WON') return TagVariant.SUCCESS;
        if ((dispute as any)?.defensibility === 'NOT_ACTIONABLE') return TagVariant.DEFAULT;
        if (isDisputeActionNeededUrgently(dispute)) return TagVariant.ERROR;
        return TagVariant.DEFAULT;
    }, [dispute]);

    return <Tag variant={variant} label={disputeStatus} />;
};

export default DisputeStatusTag;
