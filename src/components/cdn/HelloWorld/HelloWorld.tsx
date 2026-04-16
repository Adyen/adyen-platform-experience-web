import type { FunctionalComponent, FunctionComponent } from 'preact';
import type { IconProps } from '../../internal/Icon';
import { classes } from './constants';
import './HelloWorld.scss';

export type HelloWorldProps = {
    components: {
        Icon: FunctionComponent<IconProps>;
    };
};

const HelloWorld: FunctionalComponent<HelloWorldProps> = ({ components }: HelloWorldProps) => {
    const message = 'By using this page, you agree to content delivery via CDN.';
    const { Icon } = components;
    return (
        <div className={classes.base}>
            <span aria-hidden={true}>
                <Icon className={classes.icon} name="info" />
            </span>
            <p className={classes.message}>{message}</p>
        </div>
    );
};

export default HelloWorld;
