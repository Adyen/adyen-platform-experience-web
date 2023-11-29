import { _UIComponentProps } from '@src/components/types';
import UIElement from '../UIElement';
import LegalEntityDetails from './components/LegalEntityDetails/LegalEntityDetails';
import { LegalEntityDetailsProps } from './types';

export class LegalEntityDetailsElement extends UIElement<LegalEntityDetailsProps> {
    public static type = 'legalEntityDetails' as const;

    constructor(props: _UIComponentProps<LegalEntityDetailsProps>) {
        super(props);
        this.elementRef = (props && props.elementRef) || this;
        this.componentToRender = this.componentToRender.bind(this);
    }

    componentToRender = () => {
        return <LegalEntityDetails {...this.props} />;
    };
}

export default LegalEntityDetailsElement;
