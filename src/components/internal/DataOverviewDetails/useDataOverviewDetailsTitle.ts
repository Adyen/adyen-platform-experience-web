import { boolOrFalse } from '../../../utils';
import { useModalContext } from '../Modal/Modal';
import { useEffect, useState } from 'preact/hooks';
import type { TranslationKey } from '../../../translations';
import type { ExternalUIComponentProps } from '../../types';
import type { DetailsComponentProps } from './types';

type _BaseUseDataOverviewDetailsTitleProps = Pick<ExternalUIComponentProps<DetailsComponentProps>, 'hideTitle' | 'type'>;

export const TITLES_BY_TYPE = {
    transaction: 'transactions.details.title',
    payout: 'payouts.details.title',
} as const satisfies Record<_BaseUseDataOverviewDetailsTitleProps['type'], TranslationKey>;

export const useDataOverviewDetailsTitle = <T extends _BaseUseDataOverviewDetailsTitleProps>({ hideTitle: _hideTitle, type }: T) => {
    const { withinModal } = useModalContext();
    const [forcedHideTitle, setForcedHideTitle] = useState(false);

    const hideTitle = forcedHideTitle || boolOrFalse(_hideTitle);
    const titleKey = TITLES_BY_TYPE[type];

    useEffect(() => {
        // ensure title is always hidden within overview details modal
        setForcedHideTitle(withinModal);
    }, [withinModal]);

    return { hideTitle, titleKey } as const;
};

export default useDataOverviewDetailsTitle;
