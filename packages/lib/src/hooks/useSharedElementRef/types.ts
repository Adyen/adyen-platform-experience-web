export interface UseSharedElementRefConfig {
    shouldRetainCurrentElement?: (currentElem: HTMLElement, candidateElem: HTMLElement) => any;
    withCurrentElement?: (currentElement: HTMLElement) => any;
}
