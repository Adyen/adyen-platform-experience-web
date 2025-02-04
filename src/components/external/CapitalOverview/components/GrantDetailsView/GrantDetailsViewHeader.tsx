import { FunctionalComponent } from 'preact';
import Icon from '../../../../internal/Icon';
import Button from '../../../../internal/Button/Button';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { ButtonVariant } from '../../../../internal/Button/types';
import { Header, HeaderProps } from '../../../../internal/Header';
import type { GrantDetailsViewProps } from './types';

export interface GrantDetailsViewHeaderProps extends Pick<GrantDetailsViewProps, 'onDetailsClose'>, Omit<HeaderProps, 'children'> {}

export const GrantDetailsViewHeader: FunctionalComponent<GrantDetailsViewHeaderProps> = ({ onDetailsClose, ...headerProps }) => {
    const { i18n } = useCoreContext();
    return (
        <Header {...headerProps}>
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
    );
};
