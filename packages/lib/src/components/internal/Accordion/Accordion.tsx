import { useCallback, useState } from 'preact/hooks';
import ChevronDown from '../SVGIcons/ChevronDown';
import ChevronUp from '../SVGIcons/ChevronUp';
import { AccordionProps } from './types';
import './Accordion.scss';

function Accordion({
    type = 'button',
    children,
    chevronPosition,
    className,
    expanded,
    onChange,
    headerLeft,
    headerRight,
    ...restAttributes
}: AccordionProps) {
    const [isExpanded, setIsExpanded] = useState(expanded ?? false);

    const toggle = useCallback(() => {
        if (onChange && typeof expanded === 'boolean') return onChange();
        setIsExpanded(!isExpanded);
    }, [expanded, isExpanded, onChange]);

    return (
        <div className={'adyen-pe-accordion'}>
            <div className={'adyen-pe-accordion__header'}>
                <button className={'adyen-pe-accordion__header-container'} type={type} onClick={toggle} {...restAttributes}>
                    <div className={'adyen-pe-accordion__header-controller'}>
                        {headerLeft}
                        {isExpanded ? <ChevronUp /> : <ChevronDown />}
                    </div>
                </button>
                <div>{headerRight}</div>
            </div>
            {isExpanded && <div className={'adyen-pe-accordion--content'}>{children}</div>}
        </div>
    );
}

export default Accordion;
