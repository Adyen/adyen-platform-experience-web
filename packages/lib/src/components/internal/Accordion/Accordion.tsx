import classnames from 'classnames';
import { PropsWithChildren } from 'preact/compat';
import { useCallback, useState } from 'preact/hooks';
import ChevronDown from '../SVGIcons/ChevronDown';
import ChevronUp from '../SVGIcons/ChevronUp';
import { AccordionProps } from './types';
import './Accordion.scss';

function Accordion({ children, classNames, header, headerInformation }: PropsWithChildren<AccordionProps>) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggle = useCallback(() => {
        setIsExpanded(!isExpanded);
    }, [isExpanded]);

    return (
        <div className={classnames('adyen-pe-accordion', classNames)}>
            <div className={'adyen-pe-accordion__header'}>
                <button className={'adyen-pe-accordion__header-container'} onClick={toggle}>
                    <div className={'adyen-pe-accordion__header-controller'}>
                        {header}
                        {isExpanded ? <ChevronUp /> : <ChevronDown />}
                    </div>
                </button>
                {headerInformation && <div>{headerInformation}</div>}
            </div>
            {isExpanded && <div className={'adyen-pe-accordion--content'}>{children}</div>}
        </div>
    );
}

export default Accordion;
