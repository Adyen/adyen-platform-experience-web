export const popoverUtil = (<T extends Element, U extends Function>() => {
    let popoverRefs: Array<{ element: T; callback?: U | undefined }> = [];

    const closePopoversOutsideOfClick = (eventPath: EventTarget[]) => {
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
            closeNestedPopovers(0);
        } else {
            index + 1 <= popoverRefs.length - 1 && closeNestedPopovers(index + 1);
        }
    };

    const remove = (currentRef: T) => {
        const index = popoverRefs.findIndex(refs => refs.element.getAttribute('id') === currentRef.getAttribute('id'));
        if (index >= 0) {
            popoverRefs.splice(index, 1);
        }
    };

    const add = (currentRef: T, callback: U | undefined) => {
        const index = popoverRefs.findIndex(refs => refs.element.getAttribute('id') === currentRef.getAttribute('id'));
        if (index >= 0) return;
        popoverRefs.push({ element: currentRef, callback: callback });
    };

    const closeNestedPopovers = (fromIndex: number) => {
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

    return { add, remove, closeAll, closePopoversOutsideOfClick };
})();
