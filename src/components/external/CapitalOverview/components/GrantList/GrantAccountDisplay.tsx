import { FunctionalComponent } from 'preact';
import { EMPTY_ARRAY } from '../../../../../utils';
import { GrantDetailsView } from './constants';
import type { GrantDetailsViewProps } from './types';
import { ButtonVariant } from '../../../../internal/Button/types';
import Icon from '../../../../internal/Icon';
import Button from '../../../../internal/Button/Button';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { Header } from '../../../../internal/Header';
import { TranslationKey } from '../../../../../translations';

type GrantAccountDisplayProps = Omit<GrantDetailsViewProps, 'detailsView'> & {
    detailsView: typeof GrantDetailsView.EARLY_REPAYMENT | typeof GrantDetailsView.REVOCATION;
};

// [TODO]: Move these source strings to translations file
const titleKey = 'Early repayment' as TranslationKey;
const subtitleKey = 'Transfer money to this bank account to repay back part of your loan or the entirety of it.' as TranslationKey;

export const GrantAccountDisplay: FunctionalComponent<GrantAccountDisplayProps> = ({ detailsView, grant, onDisplayClose }) => {
    const [bankAccount] = grant[detailsView] ?? EMPTY_ARRAY;
    const { i18n } = useCoreContext();

    if (bankAccount && detailsView === GrantDetailsView.EARLY_REPAYMENT) {
        return (
            <div>
                <Header titleKey={titleKey} subtitleKey={subtitleKey}>
                    <Button
                        onClick={onDisplayClose}
                        variant={ButtonVariant.TERTIARY}
                        iconButton
                        classNameModifiers={['circle']}
                        aria-label={i18n.get('dismiss')}
                    >
                        <Icon name="cross" />
                    </Button>
                </Header>
            </div>
        );
    }

    return null;
};
