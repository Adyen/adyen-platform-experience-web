import useCoreContext from '../../../../core/Context/useCoreContext';
import Typography from '../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../internal/Typography/types';
import { CapitalHeader } from '../../../internal/CapitalHeader';

const Unqualified = ({ hideTitle }: { hideTitle?: boolean }) => {
    const { i18n, getImageAsset } = useCoreContext();

    return (
        <>
            <CapitalHeader hideTitle={hideTitle} titleKey={'capital.overview.common.titles.qualificationIntro'} />
            <div className={'adyen-pe-capital-overview__unqualified-state'}>
                <div className="adyen-pe-capital-overview__unqualified-state-img">
                    <img srcSet={getImageAsset?.({ name: 'generic-use-first-touch' })} alt="" />
                </div>
                <Typography el={TypographyElement.PARAGRAPH} variant={TypographyVariant.BODY} large>
                    {i18n.get('capital.overview.unqualified.soonQualifyInfo')}
                </Typography>
            </div>
        </>
    );
};

export default Unqualified;
