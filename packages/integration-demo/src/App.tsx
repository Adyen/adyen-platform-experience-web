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

const SidebarSection = ({ section }: { section: NavSection }) => {
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
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const App = () => (
    <BrowserRouter>
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar__header">
                    <span className="sidebar__logo">{'Adyen'}</span>
                    <span className="sidebar__title">{'Platform Experience'}</span>
                </div>
                <nav className="sidebar__nav">
                    {NAV_SECTIONS.map(section => (
                        <SidebarSection key={section.label} section={section} />
                    ))}
                </nav>
            </aside>
            <main className="content">
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
            </main>
        </div>
    </BrowserRouter>
);
