import { ExpandableContainerProps } from './types';
import { useCallback, useState } from 'preact/hooks';
import './ExpandableContainer.scss';
import { FunctionalComponent } from 'preact';
import { AriaAttributes } from 'preact/compat';
import { EXPANDABLE_CONTAINER_CLASS_NAMES } from './constants';
import cx from 'classnames';
import Button from '../Button/Button';
import { ButtonVariant } from '../Button/types';
import Icon from '../Icon';
import uuid from '../../../utils/random/uuid';

export const ExpandableContainer: FunctionalComponent<ExpandableContainerProps & Pick<AriaAttributes, 'aria-label'>> = ({
    className,
    children,
    ['aria-label']: ariaLabel,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const contentId = uuid();

    const toggleIsOpen = useCallback(() => {
        setIsOpen(prevIsOpen => !prevIsOpen);
    }, []);

    return (
        <div className={cx(EXPANDABLE_CONTAINER_CLASS_NAMES.base, className)} data-testid="expandable-container">
            {isOpen && (
                <div id={contentId} className={EXPANDABLE_CONTAINER_CLASS_NAMES.content}>
                    {children}
                </div>
            )}
            <Button
                variant={ButtonVariant.TERTIARY_WITH_BACKGROUND}
                condensed
                fullWidth
                onClick={toggleIsOpen}
                aria-controls={contentId}
                aria-expanded={isOpen}
                aria-label={ariaLabel}
            >
                <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} className={EXPANDABLE_CONTAINER_CLASS_NAMES.toggleButtonIcon} />
            </Button>
        </div>
    );
};
