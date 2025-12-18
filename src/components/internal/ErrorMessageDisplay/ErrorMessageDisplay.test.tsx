/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/preact';
import { userEvent } from '@testing-library/user-event';
import { ErrorMessageDisplay, IMAGE_BREAKPOINT_MEDIUM_PX } from './ErrorMessageDisplay';
import useCoreContext from '../../../core/Context/useCoreContext';
import { TranslationKey } from '../../../translations';

vi.mock('../../../core/Context/useCoreContext');

const TEST_LABELS = {
    MESSAGE: 'Please try again later',
    MESSAGE_2: 'Contact support if issue persists',
    REFRESH: 'Refresh',
    SUPPORT: 'Contact Support',
    TITLE: 'Something went wrong',
} as const;

describe('ErrorMessageDisplay', () => {
    const mockI18n = {
        get: vi.fn((key: TranslationKey) => {
            const translations: Partial<Record<TranslationKey, string>> = {
                ['common.actions.contactSupport.labels.reachOut']: TEST_LABELS.SUPPORT,
                ['common.actions.refresh.labels.default']: TEST_LABELS.REFRESH,
                ['testMessage' as TranslationKey]: TEST_LABELS.MESSAGE,
                ['testMessage2' as TranslationKey]: TEST_LABELS.MESSAGE_2,
                ['testTitle' as TranslationKey]: TEST_LABELS.TITLE,
            };
            return translations[key] || key;
        }),
    };

    const mockUpdateCore = vi.fn();
    const mockGetImageAsset = vi.fn(() => 'default-image.svg');

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCoreContext).mockReturnValue({
            i18n: mockI18n,
            updateCore: mockUpdateCore,
            getImageAsset: mockGetImageAsset,
        } as any);
    });

    describe('Rendering', () => {
        test('should render with title only', () => {
            render(<ErrorMessageDisplay title={'testTitle' as TranslationKey} />);

            const title = screen.getByText(TEST_LABELS.TITLE);
            expect(title).toBeInTheDocument();
            expect(mockI18n.get).toHaveBeenCalledWith('testTitle');
        });

        test('should render with title and single message', () => {
            render(<ErrorMessageDisplay title={'testTitle' as TranslationKey} message={'testMessage' as TranslationKey} />);

            const title = screen.getByText(TEST_LABELS.TITLE);
            const message = screen.getByText(TEST_LABELS.MESSAGE);

            expect(title).toBeInTheDocument();
            expect(message).toBeInTheDocument();
            expect(mockI18n.get).toHaveBeenCalledWith('testTitle');
            expect(mockI18n.get).toHaveBeenCalledWith('testMessage');
        });

        test('should render with title and array of messages', () => {
            render(
                <ErrorMessageDisplay
                    title={'testTitle' as TranslationKey}
                    message={['testMessage' as TranslationKey, 'testMessage2' as TranslationKey]}
                />
            );

            // Both messages are rendered in the same paragraph, separated by <br />
            const messageContainer = screen.getByText((_, element) => {
                return element?.textContent === `${TEST_LABELS.MESSAGE}  ${TEST_LABELS.MESSAGE_2}`;
            });

            expect(messageContainer).toBeInTheDocument();
            expect(mockI18n.get).toHaveBeenCalledWith('testMessage');
            expect(mockI18n.get).toHaveBeenCalledWith('testMessage2');
        });

        test('should render with desktop and mobile images', () => {
            const { container } = render(
                <ErrorMessageDisplay title={'testTitle' as TranslationKey} imageDesktop="desktop.svg" imageMobile="mobile.svg" />
            );

            const image = screen.getByRole('img');
            expect(image).toHaveAttribute('alt', '');

            // Verify picture element has correct sources for responsive images
            const sources = container.querySelectorAll('source');
            expect(sources).toHaveLength(2);
            expect(sources[0]).toHaveAttribute('media', `(min-width: ${IMAGE_BREAKPOINT_MEDIUM_PX}px)`);
            expect(sources[0]).toHaveAttribute('srcSet', 'desktop.svg');
            expect(sources[1]).toHaveAttribute('media', `(max-width: ${IMAGE_BREAKPOINT_MEDIUM_PX}px)`);
            expect(sources[1]).toHaveAttribute('srcSet', 'mobile.svg');
        });

        test('should render with default image when withImage is true', () => {
            render(<ErrorMessageDisplay title={'testTitle' as TranslationKey} withImage={true} />);

            const image = screen.getByRole('img');
            expect(image).toHaveAttribute('alt', '');
            expect(mockGetImageAsset).toHaveBeenCalledWith({ name: 'wrong-environment' });
        });

        test('should not render image section when no image props provided', () => {
            render(<ErrorMessageDisplay title={'testTitle' as TranslationKey} />);

            const image = screen.queryByRole('img');
            expect(image).not.toBeInTheDocument();
        });
    });

    describe('Conditional Styling', () => {
        test('should apply default styling classes', () => {
            const { container } = render(<ErrorMessageDisplay title={'testTitle' as TranslationKey} />);

            const errorDisplay = container.querySelector('.adyen-pe-error-message-display--absolute-position');
            const outlined = container.querySelector('.adyen-pe-error-message-display--outlined');

            expect(errorDisplay).toBeInTheDocument();
            expect(outlined).toBeInTheDocument();
        });

        test('should not apply outlined class when outlined is false', () => {
            const { container } = render(<ErrorMessageDisplay title={'testTitle' as TranslationKey} outlined={false} />);

            const errorDisplay = container.querySelector('.adyen-pe-error-message-display--outlined');
            expect(errorDisplay).not.toBeInTheDocument();
        });

        test('should apply centered class when centered is true', () => {
            const { container } = render(<ErrorMessageDisplay title={'testTitle' as TranslationKey} centered={true} />);

            const errorDisplay = container.querySelector('.adyen-pe-error-message-display--centered');
            expect(errorDisplay).toBeInTheDocument();
        });

        test('should apply background class when withBackground is true and outlined is false', () => {
            const { container } = render(<ErrorMessageDisplay title={'testTitle' as TranslationKey} withBackground={true} outlined={false} />);

            const errorDisplay = container.querySelector('.adyen-pe-error-message-display--with-background');
            expect(errorDisplay).toBeInTheDocument();
        });
    });

    describe('Button Interactions', () => {
        test('should render and call onContactSupport when support button is clicked', async () => {
            const user = userEvent.setup();
            const onContactSupport = vi.fn();

            render(<ErrorMessageDisplay title={'testTitle' as TranslationKey} onContactSupport={onContactSupport} />);

            const supportButton = screen.getByRole('button', { name: TEST_LABELS.SUPPORT });
            await user.click(supportButton);

            expect(onContactSupport).toHaveBeenCalledOnce();
        });

        test('should render refresh button and call updateCore when clicked', async () => {
            const user = userEvent.setup();

            render(<ErrorMessageDisplay title={'testTitle' as TranslationKey} refreshComponent={true} />);

            const refreshButton = screen.getByRole('button', { name: TEST_LABELS.REFRESH });
            await user.click(refreshButton);

            expect(mockUpdateCore).toHaveBeenCalledOnce();
        });

        test('should not render refresh button when onContactSupport is provided', () => {
            const onContactSupport = vi.fn();

            render(<ErrorMessageDisplay title={'testTitle' as TranslationKey} onContactSupport={onContactSupport} refreshComponent={true} />);

            screen.getByRole('button', { name: TEST_LABELS.SUPPORT });
            const refreshButton = screen.queryByRole('button', { name: TEST_LABELS.REFRESH });

            expect(refreshButton).not.toBeInTheDocument();
        });

        test('should render custom secondary button when provided', () => {
            const renderSecondaryButton = () => <button>{'Custom Action'}</button>;

            render(<ErrorMessageDisplay title={'testTitle' as TranslationKey} renderSecondaryButton={renderSecondaryButton} />);

            screen.getByRole('button', { name: 'Custom Action' });
        });
    });

    describe('Translation Values', () => {
        test('should render custom translation values with array of messages', () => {
            const customElement1 = <span data-testid="custom-1">{'Custom 1'}</span>;
            const customElement2 = <span data-testid="custom-2">{'Custom 2'}</span>;
            const translationValues = {
                testMessage: customElement1,
                testMessage2: customElement2,
            };

            render(
                <ErrorMessageDisplay
                    title={'testTitle' as TranslationKey}
                    message={['testMessage' as TranslationKey, 'testMessage2' as TranslationKey]}
                    translationValues={translationValues as any}
                />
            );

            const custom1 = screen.getByTestId('custom-1');
            const custom2 = screen.getByTestId('custom-2');

            expect(custom1).toBeInTheDocument();
            expect(custom1).toHaveTextContent('Custom 1');
            expect(custom2).toBeInTheDocument();
            expect(custom2).toHaveTextContent('Custom 2');
        });
    });
});
