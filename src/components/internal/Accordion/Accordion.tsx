import classnames from 'classnames';
import { PropsWithChildren, useEffect } from 'preact/compat';
import { useCallback, useRef, useState } from 'preact/hooks';
import Icon from '../Icon';
import {
    ACCORDION_BASE_CLASS,
    ACCORDION_CONTENT_CLASS,
    ACCORDION_HEADER_CLASS,
    ACCORDION_HEADER_CONTAINER_CLASS,
    ACCORDION_HEADER_CONTROLLER_CLASS,
} from './constants';
import { AccordionProps } from './types';
import './Accordion.scss';

function Accordion({ children, classNames, header, headerInformation, renderChevron }: PropsWithChildren<AccordionProps>) {
    const [isExpanded, setIsExpanded] = useState(false);
    const accordionContentRef = useRef<HTMLDivElement>(null);

    const toggle = useCallback(() => {
        setIsExpanded(!isExpanded);
    }, [isExpanded]);

    useEffect(() => {
        if (renderChevron) {
            renderChevron(
                <Icon
                    role="button"
                    area-hidden={false}
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    id={'accordion-controller'}
                    aria-controls="accordion-content"
                    aria-expanded={isExpanded}
                    tabIndex={1}
                />
            );
        }
    }, [renderChevron, isExpanded]);

    return (
        <div className={classnames(ACCORDION_BASE_CLASS, classNames)}>
            <h3 className={ACCORDION_HEADER_CLASS}>
                <button role={'presentation'} aria-hidden={true} tabIndex={-1} className={ACCORDION_HEADER_CONTAINER_CLASS} onClick={toggle}>
                    <div className={ACCORDION_HEADER_CONTROLLER_CLASS}>{header}</div>
                    {!renderChevron && (
                        <Icon
                            role="button"
                            area-hidden={false}
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            id={'accordion-controller'}
                            aria-controls="accordion-content"
                            aria-expanded={isExpanded}
                            tabIndex={1}
                        />
                    )}
                </button>
                {headerInformation && <div>{headerInformation}</div>}
            </h3>
            {
                <div
                    role="region"
                    id={'accordion-content'}
                    aria-labelledby="accordion-controller"
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
