const { host, protocol } = window.location;

export const httpPost = (endpoint, data) =>
    fetch(`${protocol}//${host}/${endpoint}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => response.json());

export const checkPaymentResult = resultCode => ['authorised', 'received', 'pending'].includes(resultCode?.toLowerCase());

export const getSearchParameters = (search = window.location.search) =>
    search
        .replace(/\?/g, '')
        .split('&')
        .reduce((acc, cur) => {
            const [key, prop = ''] = cur.split('=');
            acc[key] = decodeURIComponent(prop);
            return acc;
        }, {});

const insertHeader = pages => {
    const container = document.querySelector('header');

    if (!container) return;

    const links = pages
        .filter(page => page.id !== 'Result')
        .map(({ name, id }, index) => {
            const url = `/${index ? id.toLowerCase() : ''}`;
            const isActivePage = window.location.pathname === url;

            return `
                <li class="playground-nav__item ${isActivePage ? 'playground-nav__item--active' : ''}">
                    <a href="${url}" class="playground-nav__link">${name}</a>
                </li>
            `;
        });

    const header = `
        <button type="button" class="playground-nav-button" aria-label="Toggle nav">
            <span aria-hidden></span>
        </button>

        <p>Adyen FP <span>Dev</span></p>

        <nav class="playground-nav">
            <ul class="playground-nav__list">${links.join('')}</ul>
        </nav>
    `;

    container.innerHTML = header;
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

if (window.htmlPages) {
    insertHeader(window.htmlPages);
    // addEventListeners();
}
