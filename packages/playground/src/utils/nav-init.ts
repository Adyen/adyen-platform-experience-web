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
            const target = e.target as HTMLAnchorElement;
            const url = target.href + window.location.search;
            window.location.assign(url);
        });
    });

    document.querySelector('.playground-nav-button')?.addEventListener('click', e => {
        const target = e.target as HTMLAnchorElement;
        target.classList.toggle('playground-nav-button--open');
        document.body.classList.toggle('nav-open');
    });
};

if (window.htmlPages) {
    insertHeader(window.htmlPages);
    // addEventListeners();
}
