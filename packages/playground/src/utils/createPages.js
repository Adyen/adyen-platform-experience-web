import { pages } from '../../pages';
import { Theme } from '@adyen/adyen-platform-experience-web';

const insertHeader = pages => {
    const container = document.querySelector('header');
    const links = pages.map(page => {
        const url = `/src/pages/${page.id}/`;
        const isActivePage = window.location.pathname === url;
        return `
            <li class="playground-nav__item ${isActivePage ? 'playground-nav__item--active' : ''}">
                <a href="${url}" class="playground-nav__link">${page.name}</a>
            </li>
        `;
    });

    const header = `
      <div class="playground-header">
        <button type="button" class="playground-nav-button" aria-label="Toggle nav">
            <span aria-hidden></span>
        </button>

        <p>Adyen PE <span>Dev</span></p>

        <nav class="playground-nav">
            <ul class="playground-nav__list">${links.join('')}</ul>
        </nav>
      </div>
    `;

    new Theme({ neutral: '#fcf0e2', background: '#fffbf9', primary: '#8b2f00', label: '#797979' }).apply();
    // new Theme({ primary: '#2292bc', outline: '#1e506a', neutral: '#2d3251', background: '#151726', label: '#ebebeb' }).apply();
    //new Theme({ neutral: '#e8f4e5', label: '007923', primary: '#014314' }).apply();

    if (container) container.innerHTML = header;
};

const addEventListeners = () => {
    document.querySelectorAll('.playground-nav__link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const url = e.target.href + window.location.search;
            window.location.assign(url);
        });
    });

    document.querySelector('.playground-nav-button').addEventListener('click', e => {
        e.target.classList.toggle('playground-nav-button--open');
        document.body.classList.toggle('nav-open');
    });
};

insertHeader(pages);
// addEventListeners();
