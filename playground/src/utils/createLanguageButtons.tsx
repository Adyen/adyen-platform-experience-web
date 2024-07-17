import { Core } from '@adyen/adyen-platform-experience-web';

export const createLanguageButtons = ({ locales, core }: { locales: string[]; core: Core<any, any> }) => {
    const pageContainer = document.querySelector('.playground-header');

    const container = `<div class="locale-selection-container"></div>`;

    const langSelector = document.createElement('div');
    langSelector.className = 'locale-selection-container';
    langSelector.innerHTML = container;

    locales.forEach(locale => {
        const selector = langSelector?.querySelector('.locale-selection-container');
        const buttonElement = document.createElement('button');
        buttonElement.onclick = async () => {
            await core.update({ locale: locale });
        };
        buttonElement.innerHTML = locale.toUpperCase();

        selector?.append(buttonElement);
    });

    if (pageContainer) pageContainer.append(langSelector);
};
