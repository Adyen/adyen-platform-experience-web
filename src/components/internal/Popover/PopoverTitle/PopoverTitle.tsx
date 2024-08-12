import Typography from '../../Typography/Typography';
import { TypographyVariant } from '../../Typography/types';
import { memo } from 'preact/compat';

export interface PopoverTitleProps {
    title: string;
    isImageTitle?: boolean;
}
function PopoverTitle({ title, isImageTitle = false }: PopoverTitleProps) {
    const getVariant = (): TypographyVariant => {
        return isImageTitle ? TypographyVariant.SUBTITLE : TypographyVariant.BODY;
    };

    return (
        <Typography strongest={!isImageTitle} variant={getVariant()}>
            {title}
        </Typography>
    );
}

export default memo(PopoverTitle);
