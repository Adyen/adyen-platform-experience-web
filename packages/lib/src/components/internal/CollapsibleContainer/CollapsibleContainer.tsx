import classNames from 'classnames';
import { PropsWithChildren } from 'preact/compat';
import './CollapsibleContainer.scss';
import { useChildrenHeight } from './useChildrenHeight';
import { useEffect, useState } from 'preact/hooks';

function CollapsibleContainer({ isOpen, children }: PropsWithChildren<{ isOpen: boolean }>) {
    const [height, childrenRef] = useChildrenHeight();
    const [withAnimation, setWithAnimation] = useState(false);
    useEffect(() => {
        if (!withAnimation && !isOpen) setWithAnimation(true);
    }, [isOpen]);

    return (
        <div
            className={classNames('adyen-fp-collapsible-container', {
                'adyen-fp-collapsible-container--with-transition': !isOpen || (isOpen && withAnimation),
            })}
            style={{
                height: isOpen ? height : 0,
            }}
        >
            <div className="adyen-fp-collapsible-container__content" ref={childrenRef}>
                {children}
            </div>
        </div>
    );
}

export default CollapsibleContainer;
