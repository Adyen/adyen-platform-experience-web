export const currentPopoverUtil = (<T extends Element, U extends Function>() => {
    let popoverRefs: Array<{ element: T; callback?: U | undefined }> = [];

    const closeNecessaryElements = (currentRef: T, eventPath: EventTarget[]) => {
        const index = eventPath.reduce((index: number, path: EventTarget) => {
            const pathMatchIndex =
                path instanceof Node
                    ? popoverRefs.findIndex(popoverRef => {
                          const popoverRefId = popoverRef.element.getAttribute('id');
                          const pathId = path && (path as HTMLElement)?.getAttribute ? (path as HTMLElement)?.getAttribute('id') : null;
                          return popoverRefId === pathId;
                      })
                    : -1;
            if (index === -1 && pathMatchIndex !== -1) return pathMatchIndex;
            return index;
        }, -1);
        if (index === -1) {
            closeSomePopovers(0);
        } else {
            index + 1 <= popoverRefs.length - 1 && closeSomePopovers(index + 1);
        }
    };

    const remove = (currentRef: T) => {
        const index = popoverRefs.findIndex(refs => refs.element.isSameNode(currentRef));
        if (index >= 0) {
            popoverRefs.splice(index, 1);
        }
    };

    const add = (currentRef: T, callback: U | undefined) => {
        const index = popoverRefs.findIndex(refs => refs.element.isSameNode(currentRef));
        if (index >= 0) return;
        popoverRefs.push({ element: currentRef, callback: callback });
    };

    const closeSomePopovers = (fromIndex: number) => {
        const popoverLength = popoverRefs.length;
        for (let i = fromIndex; i < popoverLength; i++) {
            popoverRefs?.[i]?.callback?.();
        }
        popoverRefs.splice(fromIndex);
    };

    const closeAll = () => {
        popoverRefs.forEach(ref => ref?.callback?.());
        popoverRefs = [];
    };

    return { add, remove, closeAll, closeNecessaryElements };
})();
