import { pages } from '../pages';

function createElementWithStyles(tag, styles) {
    const element = document.createElement(tag);
    element.style.cssText = styles;
    return element;
}

const insertHeader = pages => {
    const container = document.querySelector('header');
    const links = pages.map(page => {
        const url = `/pages/${page.id}/`;
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
        </nav>`;

    if (container) container.innerHTML = header;

    const modal = createElementWithStyles(
        'div',
        'background: rgba(0, 0, 0, 0.51); width: 100%; height: 100%; position: absolute; top: 0; display: flex; align-items: flex-start; cursor: pointer'
    );
    modal.onclick = () => modal.remove();

    const alert = createElementWithStyles(
        'div',
        'background: #fff5e9; width: 500px; padding: 30px; border-radius: 5px; border: 1px solid black; margin: 200px 0 0 350px;'
    );
    alert.innerText =
        'Playground is being deprecated, so please use storybook. If you find anything missing that you can only find using playground, notify the team.';

    modal.appendChild(alert);
    document.body.appendChild(modal);
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
/*alert(
    'Playground is being deprecated. Please use storybook. If you find anything missing there that you can only find using playground, notify the team'
);*/
// addEventListeners();
