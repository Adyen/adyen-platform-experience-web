import type { CoreInstance, UIElementProps } from '@integration-components/core/vue';
import type { ChatMessage, PietActionCleanup, PietActionRequest, PietProps } from '../../../domain/src';

/**
 * Mounts the flow for an action inside `container` (a modal body) and returns how to tear it down.
 * Piet cannot import other domains, so the host application builds the element, e.g.
 * `new TransactionDetails({ core, id }).mount(container)`, and returns `() => element.unmount()`.
 */
export type PietActionRenderer = (request: PietActionRequest, container: HTMLElement, core: CoreInstance) => PietActionCleanup | void;

export type PietExternalProps = UIElementProps &
    PietProps & {
        /**
         * Lets the user run flows suggested by the assistant (refund a transaction, accept or defend a dispute, expire or
         * create a payment link) in a modal. Without it, the assistant's action suggestions are not shown.
         */
        renderAction?: PietActionRenderer;
    };

/** What the components receive: Piet's element has already supplied the `core`. */
export type PietComponentProps = Omit<PietExternalProps, 'core' | 'appearance' | 'renderAction'> & {
    renderAction?: (request: PietActionRequest, container: HTMLElement) => PietActionCleanup | void;
};

/** A conversation message with a stable key for rendering. */
export interface PietChatMessage extends ChatMessage {
    id: number;
}
