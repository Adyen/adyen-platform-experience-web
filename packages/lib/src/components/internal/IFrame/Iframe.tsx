import { Component } from 'preact';
import { isFunction } from '@src/utils/common';

interface IframeProps {
    width?: string;
    height?: string;
    minWidth?: string;
    minHeight?: string;
    border?: string;
    src?: string;
    allow?: string;
    name?: string;
    title?: string;
    callback?: (contentWindow: Window | null) => void;
}

class Iframe extends Component<IframeProps> {
    public static defaultProps = {
        width: '0',
        height: '0',
        minWidth: '0',
        minHeight: '0',
        src: null,
        allow: null,
        title: 'components iframe',
    };

    private iframeEl: HTMLIFrameElement | null = null;

    iframeOnLoad() {
        if (this.props.callback && isFunction(this.props.callback) && this.iframeEl) {
            this.props.callback(this.iframeEl.contentWindow);
        }
    }

    componentDidMount() {
        if (this.iframeEl?.addEventListener) {
            this.iframeEl.addEventListener('load', this.iframeOnLoad.bind(this), false);
        } else if ((this.iframeEl as any)?.attachEvent) {
            // IE fallback
            (this.iframeEl as any).attachEvent('onload', this.iframeOnLoad.bind(this));
        } else {
            if (this.iframeEl) this.iframeEl.onload = this.iframeOnLoad.bind(this);
        }
    }

    componentWillUnmount() {
        if (this.iframeEl?.removeEventListener) {
            this.iframeEl.removeEventListener('load', this.iframeOnLoad.bind(this), false);
        } else if ((this.iframeEl as any).detachEvent) {
            // IE fallback
            (this.iframeEl as any).detachEvent('onload', this.iframeOnLoad.bind(this));
        } else {
            if (this.iframeEl) this.iframeEl.onload = null;
        }
    }

    render({ name, src, width, height, minWidth, minHeight, allow, title }: IframeProps) {
        return (
            <iframe
                ref={ref => {
                    this.iframeEl = ref;
                }}
                allow={allow}
                className={`adyen-pe-iframe adyen-pe-iframe--${name}`}
                name={name}
                src={src}
                width={width}
                height={height}
                style={{ border: 0 }}
                frameBorder="0"
                title={title}
                referrerpolicy="origin"
                min-width={minWidth}
                min-height={minHeight}
            />
        );
    }
}

export default Iframe;
