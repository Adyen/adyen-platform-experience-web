import { FunctionalComponent } from 'preact';
import { EMPTY_ARRAY } from '../../../../../utils';
import type { GrantDetailsViewProps } from './types';
import { ButtonVariant } from '../../../../internal/Button/types';
import Icon from '../../../../internal/Icon';
import Button from '../../../../internal/Button/Button';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { Header } from '../../../../internal/Header';

export const GrantEarlyRepaymentDetails: FunctionalComponent<GrantDetailsViewProps> = ({ grant, onDetailsClose }) => {
    const bankAccounts = grant.earlyRepaymentAccounts ?? EMPTY_ARRAY;
    const { i18n } = useCoreContext();

    return bankAccounts.length ? (
        <div>
            <Header titleKey={'capital.earlyRepayment'} subtitleKey={'capital.earlyRepaymentInstruction'}>
                <Button
                    onClick={onDetailsClose}
                    variant={ButtonVariant.TERTIARY}
                    iconButton
                    classNameModifiers={['circle']}
                    aria-label={i18n.get('dismiss')}
                >
                    <Icon name="cross" />
                </Button>
            </Header>
        </div>
    ) : null;
};
