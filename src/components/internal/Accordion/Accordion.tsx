import cx from 'classnames';
import classnames from 'classnames';
import { PropsWithChildren } from 'preact/compat';
import { useCallback, useRef, useState } from 'preact/hooks';
import ChevronDown from '../SVGIcons/ChevronDown';
import ChevronUp from '../SVGIcons/ChevronUp';
import {
    ACCORDION_BASE_CLASS,
    ACCORDION_CONTENT_CLASS,
    ACCORDION_HEADER_CLASS,
    ACCORDION_HEADER_CONTAINER_CLASS,
    ACCORDION_HEADER_CONTROLLER_CLASS,
} from './constants';
import { AccordionProps } from './types';
import './Accordion.scss';

function Accordion({ children, classNames, header, headerInformation }: PropsWithChildren<AccordionProps>) {
    const [isExpanded, setIsExpanded] = useState(false);
    const accordionContentRef = useRef<HTMLDivElement>(null);

    const toggle = useCallback(() => {
        setIsExpanded(!isExpanded);
    }, [isExpanded]);

    return (
        <div className={classnames(ACCORDION_BASE_CLASS, classNames)}>
            <h3 className={ACCORDION_HEADER_CLASS}>
                <button
                    id={'accordion-controller'}
                    aria-controls="accordion-content"
                    className={ACCORDION_HEADER_CONTAINER_CLASS}
                    onClick={toggle}
                    aria-expanded={isExpanded}
                >
                    <div className={ACCORDION_HEADER_CONTROLLER_CLASS}>
                        {header}
                        {isExpanded ? <ChevronUp height={8} width={15} /> : <ChevronDown height={8} width={15} />}
                    </div>
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
