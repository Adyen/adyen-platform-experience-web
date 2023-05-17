import CoreProvider from '../../core/Context/CoreProvider';
import UIElement from '../UIElement';
import LegalEntityDetails from './components/LegalEntityDetails/LegalEntityDetails';
import { LegalEntityDetailsProps } from './types';

export class LegalEntityDetailsElement extends UIElement<LegalEntityDetailsProps> {
    public static type = 'legalEntityDetails' as const;

    get isValid() {
        return !!this.state.isValid;
    }

    get displayName() {
        return this.props.name ?? this.type;
    }

    formatProps(props: LegalEntityDetailsProps) {
        return props;
    }

    /**
     * Formats the component data output
     */
    formatData() {
        return {
            ...this.state,
        };
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <LegalEntityDetails
                    {...this.props}
                    onChange={this.props.onChange ?? this.setState}
                    //onGetTransferInstrument={(id: string) => getTransferInstrument(id)}
                />
            </CoreProvider>
        );
    }
}

export default LegalEntityDetailsElement;
