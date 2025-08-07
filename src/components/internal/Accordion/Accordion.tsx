import classnames from 'classnames';
import { PropsWithChildren } from 'preact/compat';
import { useCallback, useRef, useState } from 'preact/hooks';
import useUniqueId from '../../../hooks/useUniqueId';
import {
    ACCORDION_BASE_CLASS,
    ACCORDION_CONTENT_CLASS,
    ACCORDION_HEADER_CLASS,
    ACCORDION_HEADER_CONTAINER_CLASS,
    ACCORDION_HEADER_CONTROLLER_CLASS,
} from './constants';
import { AccordionProps } from './types';
import Icon from '../Icon';
import './Accordion.scss';

function Accordion({ children, classNames, header, headerInformation }: PropsWithChildren<AccordionProps>) {
    const [isExpanded, setIsExpanded] = useState(false);
    const accordionContentRef = useRef<HTMLDivElement>(null);
    const toggle = useCallback(() => setIsExpanded(isExpanded => !isExpanded), []);

    const uniqueId = useUniqueId();
    const contentElementId = `accordion-content-${uniqueId}`;
    const controllerElementId = `accordion-controller-${uniqueId}`;

    return (
        <div className={classnames(ACCORDION_BASE_CLASS, classNames)}>
            <div className={ACCORDION_HEADER_CLASS}>
                <button
                    id={controllerElementId}
                    aria-controls={contentElementId}
                    className={ACCORDION_HEADER_CONTAINER_CLASS}
                    onClick={toggle}
                    aria-expanded={isExpanded}
                >
                    <div className={ACCORDION_HEADER_CONTROLLER_CLASS}>
                        {header}
                        {isExpanded ? <Icon name="chevron-up" /> : <Icon name="chevron-down" />}
                    </div>
                </button>
                {headerInformation && <div>{headerInformation}</div>}
            </div>
            {
                <div
                    role="region"
                    id={contentElementId}
                    aria-labelledby={controllerElementId}
                    style={{ maxHeight: isExpanded ? accordionContentRef?.current?.offsetHeight : 0 }}
                    className={ACCORDION_CONTENT_CLASS}
                >
                    <div ref={accordionContentRef}>{children}</div>
                </div>
            }
        </div>
    );
}

export default Accordion;
