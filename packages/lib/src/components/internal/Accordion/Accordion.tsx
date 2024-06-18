import classnames from 'classnames';
import { PropsWithChildren } from 'preact/compat';
import { useCallback, useState } from 'preact/hooks';
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

    const toggle = useCallback(() => {
        setIsExpanded(!isExpanded);
    }, [isExpanded]);

    return (
        <div className={classnames(ACCORDION_BASE_CLASS, classNames)}>
            <div className={ACCORDION_HEADER_CLASS}>
                <button className={ACCORDION_HEADER_CONTAINER_CLASS} onClick={toggle}>
                    <div className={ACCORDION_HEADER_CONTROLLER_CLASS}>
                        {header}
                        {isExpanded ? <ChevronUp /> : <ChevronDown />}
                    </div>
                </button>
                {headerInformation && <div>{headerInformation}</div>}
            </div>
            {isExpanded && <div className={ACCORDION_CONTENT_CLASS}>{children}</div>}
        </div>
    );
}

export default Accordion;
