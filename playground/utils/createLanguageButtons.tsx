import { Core } from '../../src';

export const createLanguageButtons = ({ core }: { core: Core<any, any> }) => {
    const pageContainer = document.querySelector('.playground-header');

    if (pageContainer) {
        const { localization } = core;
        const container = document.createElement('div');
        const selector = document.createElement('select');
        const locales = localization.supportedLocales;

        container.classList.add('locale-selection-container');
        selector.disabled = locales.length < 2;

        selector.addEventListener('change', async function () {
            await core.update({ locale: this.value });
        });

        locales.forEach(locale => {
            const optionElement = document.createElement('option');

            optionElement.selected = localization.locale === locale;
            optionElement.textContent = locale.toUpperCase();
            optionElement.value = locale;

            selector.appendChild(optionElement);
        });

        container.appendChild(selector);
        pageContainer.appendChild(container);
    }
};
