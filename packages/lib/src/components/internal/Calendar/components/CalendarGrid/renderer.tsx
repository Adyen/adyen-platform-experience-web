import { CalendarRenderer, CalendarRenderToken, CalendarRenderTokenContext } from '@src/components/internal/Calendar/types';
import CalendarGridDate from '@src/components/internal/Calendar/components/CalendarGrid/CalendarGridDate';

const renderer: CalendarRenderer = (token, ctx, render) => {
    switch (token) {
        case CalendarRenderToken.DATE: {
            const { dateTimeProps, props: trustedProps, ...context } = ctx as CalendarRenderTokenContext[typeof token];
            const { dateTime, displayDate } = context;
            let { children, ...props } = {} as any;

            if (render) ({ children, props } = render(token, context));

            return (
                <CalendarGridDate dateTime={dateTime} dateTimeProps={dateTimeProps} displayDate={displayDate} {...props} {...trustedProps}>
                    {children}
                </CalendarGridDate>
            );
        }
        default:
            return null;
    }
};

export default renderer;
