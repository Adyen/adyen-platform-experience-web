import useCoreContext from '../../../../core/Context/useCoreContext';
import unqualifiedImage from '../../../../images/generic-use-first-touch.svg';
import Typography from '../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../internal/Typography/types';
import { CapitalHeader } from '../../../internal/CapitalHeader';

const Unqualified = ({ hideTitle }: { hideTitle?: boolean }) => {
    const { i18n } = useCoreContext();

    return (
        <>
            <CapitalHeader hideTitle={hideTitle} titleKey={'capital.needSomeExtraMoney'} />
            <div className={'adyen-pe-capital-overview__unqualified-state'}>
                <div className="adyen-pe-capital-overview__unqualified-state-img">
                    <img srcSet={unqualifiedImage} alt="" />
                </div>
                <Typography el={TypographyElement.PARAGRAPH} variant={TypographyVariant.BODY} large>
                    {i18n.get('capital.youWillSoonQualifyForAFinancialOffer')}
                </Typography>
            </div>
        </>
    );
};

export default Unqualified;
