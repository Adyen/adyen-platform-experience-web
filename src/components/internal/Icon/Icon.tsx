import type { SvgName, SvgProps } from '../Svg/Svg';
import { Svg } from '../Svg/Svg';

export type IconName = SvgName;

type IconProps = Omit<SvgProps, 'type'>;

const Icon = ({ name, className, ...props }: IconProps) => <Svg className={className} name={name} {...props} />;

export default Icon;
