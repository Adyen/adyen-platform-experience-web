import { boolOrFalse } from '../../../utils';
import { useModalContext } from '../Modal/Modal';
import { useEffect, useMemo, useState } from 'preact/hooks';
import useCoreContext from '../../../core/Context/useCoreContext';
import type { TranslationKey } from '../../../translations';
import type { ExternalUIComponentProps } from '../../types';
import type { DetailsComponentProps } from './types';

type _BaseUseDataOverviewDetailsTitleProps = Pick<ExternalUIComponentProps<DetailsComponentProps>, 'hideTitle' | 'type'>;

export const TITLES_BY_TYPE = {
    transaction: 'transactionDetails',
    payout: 'payoutDetails',
} as const satisfies Record<_BaseUseDataOverviewDetailsTitleProps['type'], TranslationKey>;

export const useDataOverviewDetailsTitle = <T extends _BaseUseDataOverviewDetailsTitleProps>({ hideTitle: _hideTitle, type }: T) => {
    const { i18n } = useCoreContext();
    const { withinModal } = useModalContext();
    const [forcedHideTitle, setForcedHideTitle] = useState(false);

    const hideTitle = useMemo(() => forcedHideTitle || boolOrFalse(_hideTitle), [forcedHideTitle, _hideTitle]);
    const title = useMemo(() => i18n.get(TITLES_BY_TYPE[type]), [i18n, type]);

    useEffect(() => {
        // ensure title is always hidden within overview details modal
        setForcedHideTitle(withinModal);
    }, [withinModal]);

    return { hideTitle, title } as const;
};

export default useDataOverviewDetailsTitle;
