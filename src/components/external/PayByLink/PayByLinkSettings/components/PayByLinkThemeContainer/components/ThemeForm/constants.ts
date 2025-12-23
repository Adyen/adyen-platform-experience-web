import { LogoTypes } from '../../types';
import { TranslationKey } from '../../../../../../../../translations';

export const THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE = 51200; // 50KB

export const THEME_FORM_ALLOWED_FILE_TYPES = ['image/jpeg'] as const;

export const logoOptions: Record<string, LogoTypes> = {
    LOGO: 'logo',
    FULL_WIDTH_LOGO: 'fullWidthLogo',
};

export const LogoLabel = {
    logo: 'payByLink.settings.theme.logo.input.label',
    fullWidthLogo: 'payByLink.settings.theme.wideLogo.input.label',
} as Record<LogoTypes, TranslationKey>;

export const logoOptionsList: LogoTypes[] = ['logo', 'fullWidthLogo'];
