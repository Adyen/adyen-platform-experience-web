import { uniqueId } from '../../../../../../utils';
import { Checkbox } from '../../../../../internal/Checkbox';
import InputText from '../../../../../internal/FormFields/InputText';
import { TypographyVariant } from '../../../../../internal/Typography/types';
import Typography from '../../../../../internal/Typography/Typography';
import './TermsAndConditions.scss';
import { useRef } from 'preact/hooks';

export const TermsAndConditions = () => {
    const checkboxIdentifier = useRef(uniqueId());
    return (
        <section className="adyen-pe-pay-by-link-settings-terms-and-conditions">
            <Typography variant={TypographyVariant.TITLE} medium>
                Terms and conditions
            </Typography>
            <Typography variant={TypographyVariant.BODY} wide className="adyen-pe-pay-by-link-settings-terms-and-conditions-disclaimer">
                In order to comply with the latest regulations, you'll need to complete the information below.
            </Typography>
            <label
                htmlFor={checkboxIdentifier.current}
                aria-labelledby={checkboxIdentifier.current}
                className="adyen-pe-pay-by-link-settings-terms-and-conditions-input"
            >
                Your terms and conditions URL
                <InputText uniqueId={checkboxIdentifier.current} onInput={() => {}} />
            </label>

            <div className="adyen-pe-pay-by-link-settings-terms-and-conditions-checkboxes">
                <Checkbox label="I confirm that these Terms and Conditions that I send out meet all requirements" onInput={() => {}} />
                <Checkbox
                    label="I confirm that I will use this payment link for the same business line (products/business model) previously approved by [Platform_name]"
                    onInput={() => {}}
                />
            </div>
            <div>
                <Typography variant={TypographyVariant.BODY} className="adyen-pe-pay-by-link-settings-terms-and-conditions-disclaimer">
                    If you're using this payment link to gather payments for a different line of business, then you will need to reach out to support
                    for approval.
                </Typography>
            </div>
        </section>
    );
};
