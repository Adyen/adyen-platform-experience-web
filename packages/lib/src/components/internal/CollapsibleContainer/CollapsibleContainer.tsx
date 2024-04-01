import classNames from 'classnames';
import { PropsWithChildren } from 'preact/compat';
import './CollapsibleContainer.scss';
import { useEffect, useState } from 'preact/hooks';

function CollapsibleContainer({ isOpen, accessibilityId, children }: PropsWithChildren<{ isOpen: boolean; accessibilityId: string }>) {
    const [withAnimation, setWithAnimation] = useState(false);
    useEffect(() => {
        if (!withAnimation && !isOpen) setWithAnimation(true);
    }, [isOpen, withAnimation]);

    return (
        <div
            id={accessibilityId}
            className={classNames('adyen-pe-collapsible-container', {
                'adyen-pe-collapsible-container--with-transition': !isOpen || withAnimation,
                'adyen-pe-collapsible-container--collapsed': !isOpen,
            })}
        >
            <div className="adyen-pe-collapsible-container__content">{children}</div>
        </div>
    );
}

export default CollapsibleContainer;
