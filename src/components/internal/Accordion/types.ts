import { JSXInternal } from 'preact/src/jsx';

export interface AccordionProps {
    classNames?: string;
    header?: JSXInternal.Element | string; //controller?
    headerInformation?: JSXInternal.Element | string; //controller?
    renderChevron?: (e: JSXInternal.Element) => void;
}
