import { useCoreContext } from '@integration-components/core/preact';
import Typography from '@integration-components/ui-components-preact/Typography/Typography';
import { TypographyElement, TypographyVariant } from '@integration-components/ui-components-preact/Typography/types';
import { CapitalHeader } from '../../internal/CapitalHeader';

type UnqualifiedProps = {
    hideTitle?: boolean;
    region?: string;
};

const Unqualified = ({ hideTitle, region }: UnqualifiedProps) => {
    const { i18n, getImageAsset } = useCoreContext();

    return (
        <>
            <CapitalHeader hideTitle={hideTitle} region={region} titleKey={'capital.overview.common.titles.qualificationIntro'} />
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
