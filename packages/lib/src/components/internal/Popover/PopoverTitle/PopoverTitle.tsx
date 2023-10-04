import Typography from '@src/components/internal/Typography/Typography';
import { TypographyVariant } from '@src/components/internal/Typography/types';

export interface PopoverTitleProps {
    title: string;
    isImageTitle?: boolean;
}
export default function PopoverTitle({ title, isImageTitle = false }: PopoverTitleProps) {
    const getVariant = (): TypographyVariant => {
        return isImageTitle ? TypographyVariant.SUBTITLE : TypographyVariant.BODY;
    };

    return (
        <Typography strongest={!isImageTitle} variant={getVariant()}>
            {title}
        </Typography>
    );
}
