/**
 * @vitest-environment jsdom
 */
import { createContext, createRef } from 'preact';
import { MutableRef, useRef } from 'preact/hooks';
import { HTMLProps, PropsWithChildren } from 'preact/compat';
import { describe, expect, test, vi } from 'vitest';
import { render, renderHook, screen } from '@testing-library/preact';
import { ComponentHeadingType, useComponentHeadingElement, UseComponentHeadingElementProps } from './useComponentHeadingElement';
import { CoreProviderProps } from '../core/Context/types';
import { CoreContext } from '../core/Context/CoreContext';
import CoreProvider from '../core/Context/CoreProvider';

const coreProviderProps = {} as CoreProviderProps;

const ComponentRoot = ({ children }: PropsWithChildren) => <CoreProvider {...coreProviderProps}>{children}</CoreProvider>;

const Heading = ({ id, headingType, forwardedToRoot, ...props }: HTMLProps<any> & UseComponentHeadingElementProps) => {
    const { id: uniqueId, ref: headingRef } = useComponentHeadingElement<HTMLDivElement>({ headingType, forwardedToRoot });
    return <div {...props} id={id ?? uniqueId} ref={headingRef} />;
};

vi.mock(import('../core/Context/CoreContext'), () => {
    const componentRef = createRef() as MutableRef<HTMLDivElement | null>;
    const mockedCoreContext = createContext({ componentRef } as any);
    return { CoreContext: mockedCoreContext };
});

vi.mock(import('../core/Context/CoreProvider'), () => {
    const mockedCoreProvider = ({ children }: PropsWithChildren) => {
        const componentRef = useRef<HTMLDivElement | null>(null);
        return (
            <CoreContext.Provider value={{ componentRef } as any}>
                <section data-testid="root" ref={componentRef}>
                    {children}
                </section>
            </CoreContext.Provider>
        );
    };

    return { default: mockedCoreProvider };
});

describe('useComponentHeadingElement', () => {
    test('should return a unique heading element id for every initial render', () => {
        const uniqueIds: string[] = [];

        for (let i = 0; i < 3; i++) {
            const { result } = renderHook(() => useComponentHeadingElement());
            const { id: uniqueId } = result.current;

            expect(uniqueId).not.toBe('');
            expect(uniqueId).toMatch(/^heading-\d+$/);
            expect(uniqueIds).not.toContain(uniqueId);

            uniqueIds.push(uniqueId);
        }
    });

    test('should return the same heading element id for every re-render', () => {
        const { result, rerender } = renderHook(() => useComponentHeadingElement());
        const { id: uniqueId } = result.current;

        rerender();
        expect(result.current.id).toBe(uniqueId);
    });

    test('should set heading element id as ARIA attribute on componentRef element', async () => {
        const headingText = 'Title';
        const subtitleText = 'Subtitle';

        const { rerender } = render(
            <ComponentRoot>
                <Heading headingType={ComponentHeadingType.TITLE}>{headingText}</Heading>
                <Heading headingType={ComponentHeadingType.SUBTITLE}>{subtitleText}</Heading>
            </ComponentRoot>
        );

        const componentRootElement = screen.getByTestId('root');
        const headingElement = screen.getByText(headingText);
        const subtitleElement = screen.getByText(subtitleText);

        // Check that all the elements are visible as expected
        [componentRootElement, headingElement, subtitleElement].forEach(el => {
            expect(el).toBeInTheDocument();
            expect(el).toBeVisible();
        });

        expect(componentRootElement.getAttribute('aria-labeledby')).toBe(headingElement.id);
        expect(componentRootElement.getAttribute('aria-describedby')).toBe(subtitleElement.id);

        // Re-render <ComponentRoot /> component without children
        // The child <Heading /> components will be unmounted
        rerender(<ComponentRoot />);

        expect(componentRootElement.getAttribute('aria-labeledby')).toBeNull();
        expect(componentRootElement.getAttribute('aria-describedby')).toBeNull();
    });

    test('should preserve changed ARIA attribute on componentRef element when unmounted', async () => {
        const title = 'Title';
        const subtitle = 'Subtitle';

        const { rerender } = render(
            <ComponentRoot>
                <Heading headingType={ComponentHeadingType.TITLE}>{title}</Heading>
                <Heading headingType={ComponentHeadingType.SUBTITLE}>{subtitle}</Heading>
            </ComponentRoot>
        );

        const componentRootElement = screen.getByTestId('root');

        // Change ARIA attributes externally
        componentRootElement.setAttribute('aria-labeledby', title);
        componentRootElement.setAttribute('aria-describedby', subtitle);

        expect(componentRootElement.getAttribute('aria-labeledby')).toBe(title);
        expect(componentRootElement.getAttribute('aria-describedby')).toBe(subtitle);

        // Re-render <ComponentRoot /> component without children
        // The child <Heading /> components will be unmounted
        rerender(<ComponentRoot />);

        // Changed ARIA attributes preserved even after unmounting
        expect(componentRootElement.getAttribute('aria-labeledby')).toBe(title);
        expect(componentRootElement.getAttribute('aria-describedby')).toBe(subtitle);
    });
});
