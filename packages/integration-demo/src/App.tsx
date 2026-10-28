import { useState, type CSSProperties } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';

import '@adyen/adyen-platform-experience-web/adyen-platform-experience-web.css';
import { CapitalOffer, CapitalOverview } from './components/capital';
import { DisputeManagement, DisputesOverview } from './components/disputes';
import { PaymentLinkCreation, PaymentLinkDetails, PaymentLinkSettings, PaymentLinksOverview } from './components/payByLink';
import { PayoutDetails, PayoutsOverview } from './components/payouts';
import { ReportsOverview } from './components/reports';
import './main.css';
import { TransactionDetails, TransactionsOverview } from './components/transactions';
import { CONTROLS_PANEL_ID, toggleControlsPanel, useControlsPanel } from './playground/controlsPanel';
import { GlobalOptionsProvider } from './playground/GlobalOptionsProvider';

interface NavSection {
    label: string;
    icon: string;
    links: { to: string; label: string }[];
}

const NAV_SECTIONS: NavSection[] = [
    {
        label: 'Capital',
        icon: '💰',
        links: [
            { to: '/', label: 'Overview' },
            { to: '/capital-offer', label: 'Offer' },
        ],
    },
    {
        label: 'Disputes',
        icon: '⚖️',
        links: [
            { to: '/disputes', label: 'Overview' },
            { to: '/dispute-management', label: 'Management' },
        ],
    },
    {
        label: 'Payment Links',
        icon: '🔗',
        links: [
            { to: '/payment-links', label: 'Overview' },
            { to: '/payment-link-creation', label: 'Creation' },
            { to: '/payment-link-details', label: 'Details' },
            { to: '/payment-link-settings', label: 'Settings' },
        ],
    },
    {
        label: 'Payouts',
        icon: '📤',
        links: [
            { to: '/payouts', label: 'Overview' },
            { to: '/payout-details', label: 'Details' },
        ],
    },
    {
        label: 'Reports',
        icon: '📊',
        links: [{ to: '/reports', label: 'Overview' }],
    },
    {
        label: 'Transactions',
        icon: '🔄',
        links: [
            { to: '/transactions', label: 'Overview' },
            { to: '/transaction-details', label: 'Details' },
        ],
    },
];

const SidebarSection = ({ section, onNavigate }: { section: NavSection; onNavigate: () => void }) => {
    const location = useLocation();
    const isActive = section.links.some(l => l.to === location.pathname);
    const [open, setOpen] = useState(isActive);

    return (
        <div className={`sidebar__section ${isActive ? 'sidebar__section--active' : ''}`}>
            <button className="sidebar__section-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
                <span className="sidebar__section-icon">{section.icon}</span>
                <span className="sidebar__section-label">{section.label}</span>
                <span className={`sidebar__chevron ${open ? 'sidebar__chevron--open' : ''}`}>{'›'}</span>
            </button>
            <div className={`sidebar__links ${open ? 'sidebar__links--open' : ''}`}>
                <div className="sidebar__links-inner">
                    {section.links.map((link, i) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                            style={{ '--link-index': i } as CSSProperties}
                            onClick={onNavigate}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MenuIcon = ({ open }: { open: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d={open ? 'M5 5l10 10M15 5L5 15' : 'M3 5h14M3 10h14M3 15h14'} />
    </svg>
);

const SlidersIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <path d="M2 4h7M13 4h1M2 12h1M7 12h7" />
        <circle cx="11" cy="4" r="2" />
        <circle cx="5" cy="12" r="2" />
    </svg>
);

const Sidebar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const controlsPanel = useControlsPanel();
    const closeMenu = () => setMenuOpen(false);

    return (
        <aside className={`sidebar ${menuOpen ? 'sidebar--menu-open' : ''}`} onKeyDown={event => event.key === 'Escape' && closeMenu()}>
            <div className="sidebar__header">
                <button
                    type="button"
                    className="sidebar__menu-button"
                    aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
                    aria-expanded={menuOpen}
                    aria-controls="sidebar-nav"
                    onClick={() => setMenuOpen(open => !open)}
                >
                    <MenuIcon open={menuOpen} />
                </button>
                <div className="sidebar__brand">
                    <span className="sidebar__logo">{'Adyen'}</span>
                    <span className="sidebar__title">{'Platform Experience'}</span>
                </div>
                {controlsPanel.available && (
                    <button
                        type="button"
                        className="sidebar__controls-toggle"
                        aria-expanded={controlsPanel.open}
                        aria-controls={CONTROLS_PANEL_ID}
                        onClick={toggleControlsPanel}
                    >
                        <SlidersIcon />
                        <span className="sidebar__controls-label">{controlsPanel.open ? 'Hide controls' : 'Show controls'}</span>
                    </button>
                )}
            </div>
            <nav id="sidebar-nav" className="sidebar__nav" aria-label="Components">
                {NAV_SECTIONS.map(section => (
                    <SidebarSection key={section.label} section={section} onNavigate={closeMenu} />
                ))}
            </nav>
            {menuOpen && <div className="sidebar__backdrop" aria-hidden="true" onClick={closeMenu} />}
        </aside>
    );
};

export const App = () => (
    <BrowserRouter>
        <div className="app-layout">
            <Sidebar />
            <main className="content">
                <GlobalOptionsProvider>
                    <Routes>
                        <Route path="/" element={<CapitalOverview />} />
                        <Route path="/capital-offer" element={<CapitalOffer />} />
                        <Route path="/disputes" element={<DisputesOverview />} />
                        <Route path="/dispute-management" element={<DisputeManagement />} />
                        <Route path="/payment-links" element={<PaymentLinksOverview />} />
                        <Route path="/payment-link-creation" element={<PaymentLinkCreation />} />
                        <Route path="/payment-link-details" element={<PaymentLinkDetails />} />
                        <Route path="/payment-link-settings" element={<PaymentLinkSettings />} />
                        <Route path="/payouts" element={<PayoutsOverview />} />
                        <Route path="/payout-details" element={<PayoutDetails />} />
                        <Route path="/reports" element={<ReportsOverview />} />
                        <Route path="/transactions" element={<TransactionsOverview />} />
                        <Route path="/transaction-details" element={<TransactionDetails />} />
                    </Routes>
                </GlobalOptionsProvider>
            </main>
        </div>
    </BrowserRouter>
);
