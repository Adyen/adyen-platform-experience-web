import cx from 'classnames';
import { FunctionalComponent, h } from 'preact';
import { GrantDetailsViewHeader } from './GrantDetailsViewHeader';
import type { TranslationKey } from '../../../../../translations';
import type { GrantDetailsViewProps } from './types';
import './GrantDetailsView.scss';

export interface GrantDetailsViewComponentProps extends Pick<GrantDetailsViewProps, 'onDetailsClose'>, Pick<h.JSX.HTMLAttributes, 'className'> {
    headerTitleKey?: TranslationKey;
    headerSubtitleKey?: TranslationKey;
}

export const GrantDetailsView: FunctionalComponent<GrantDetailsViewComponentProps> = ({
    children,
    className,
    headerTitleKey,
    headerSubtitleKey,
    onDetailsClose,
}) => {
    return (
        <div className={cx('adyen-pe-grant-details-view', className)}>
            <GrantDetailsViewHeader onDetailsClose={onDetailsClose} titleKey={headerTitleKey} subtitleKey={headerSubtitleKey} />
            {children}
        </div>
    );
};
