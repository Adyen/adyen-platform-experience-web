import { Core, Theme } from '@adyen/adyen-platform-experience-web';
import { updateHeaders } from './createPages';

export const createLanguageButtons = ({ locales, core }: { locales: string[]; core: Core }) => {
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

export const createDarkTheme = () => {
    const pageContainer = document.querySelector('.playground-header');

    const container = `<div class="theme-selection-container"></div>`;

    const langSelector = document.createElement('div');
    langSelector.className = 'theme-selection-container';
    langSelector.innerHTML = container;

    const darkThemeSelector = langSelector?.querySelector('.theme-selection-container');
    const buttonElement = document.createElement('button');
    buttonElement.onclick = async () => {
        document.body.style.setProperty('background', '#151726');
        const currentUrl = new URL(window.location as any);
        currentUrl.searchParams.set('theme', 'dark');
        window.history.pushState({}, '', currentUrl);

        //
        //
        //
        //
        //
        //

        new Theme({ primary: '#2292bc', outline: '#1e506a', neutral: '#2d3251', background: '#151726', label: '#ebebeb' }).apply();

        //
        //
        //
        //
        //
        //
        updateHeaders();
    };
    buttonElement.innerHTML = 'Dark theme';

    darkThemeSelector?.append(buttonElement);

    // light theme

    const lightButtonElement = document.createElement('button');
    lightButtonElement.onclick = async () => {
        document.body.style.setProperty('background', '#fff');
        const currentUrl = new URL(window.location as any);
        currentUrl.searchParams.set('theme', 'light');
        window.history.pushState({}, '', currentUrl);
        new Theme({ neutral: '#fcf0e2', background: '#fffbf9', primary: '#8b2f00', label: '#797979' }).apply();
        updateHeaders();
    };
    lightButtonElement.innerHTML = 'Light theme';

    darkThemeSelector?.append(lightButtonElement);

    if (pageContainer) pageContainer.append(langSelector);
};
