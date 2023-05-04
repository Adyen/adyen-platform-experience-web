import classNames from 'classnames';
import { PropsWithChildren } from 'preact/compat';
import './CollapsibleContainer.scss';
import { useEffect, useState } from 'preact/hooks';

function CollapsibleContainer({ isOpen, children }: PropsWithChildren<{ isOpen: boolean }>) {
    const [withAnimation, setWithAnimation] = useState(false);
    useEffect(() => {
        if (!withAnimation && !isOpen) setWithAnimation(true);
    }, [isOpen, withAnimation]);

    return (
        <div
            className={classNames('adyen-fp-collapsible-container', {
                'adyen-fp-collapsible-container--with-transition': !isOpen || withAnimation,
                'adyen-fp-collapsible-container--collapsed': !isOpen,
            })}
        >
            <div className="adyen-fp-collapsible-container__content">{children}</div>
        </div>
    );
}

export default CollapsibleContainer;
