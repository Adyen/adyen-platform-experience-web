import cx from 'classnames';
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { useCoreContext } from '@integration-components/core/preact';
import Alert from '@integration-components/ui-components-preact/Alert/Alert';
import Button from '@integration-components/ui-components-preact/Button';
import Typography from '@integration-components/ui-components-preact/Typography/Typography';
import { AlertTypeOption } from '@integration-components/ui-components-preact/Alert/types';
import { ButtonVariant } from '@integration-components/ui-components-preact/Button/types';
import { TypographyElement, TypographyVariant } from '@integration-components/ui-components-preact/Typography/types';
import {
    DISPUTE_DATA_ISSUER_COMMENT,
    DISPUTE_DATA_ISSUER_COMMENTS,
    DISPUTE_DATA_ISSUER_COMMENTS_ALERT,
    DISPUTE_DATA_ISSUER_COMMENTS_EXPANDED,
    DISPUTE_DATA_ISSUER_COMMENTS_GROUP,
    DISPUTE_DATA_ISSUER_COMMENTS_TRUNCATED,
} from './constants';
import './DisputeData.scss';

export const DisputeIssuerComments = ({ issuerComments }: { issuerComments: string[] }) => {
    const { i18n } = useCoreContext();
    const [minimumHeight, setMinimumHeight] = useState(0);
    const [maximumHeight, setMaximumHeight] = useState(0);
    const [isTruncated, setIsTruncated] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const commentsGroupRef = useRef<HTMLUListElement>(null);

    const onButtonClick = (evt: MouseEvent) => {
        evt.preventDefault();
        setIsExpanded(!isExpanded);
        commentsGroupRef.current?.style.setProperty('max-height', `${isExpanded ? minimumHeight : maximumHeight}px`);
    };

    useLayoutEffect(() => {
        if (commentsGroupRef.current) {
            const commentsGroup = commentsGroupRef.current;
            const firstComment = commentsGroup.querySelector(`:scope .${DISPUTE_DATA_ISSUER_COMMENT}`);
            const lineHeight = firstComment ? parseInt(getComputedStyle(firstComment).getPropertyValue('line-height')) : 0;

            const minimumHeight = Math.min(firstComment?.clientHeight || Infinity, lineHeight * 3); // first 3 lines
            const maximumHeight = commentsGroup.scrollHeight;

            setMinimumHeight(minimumHeight);
            setMaximumHeight(maximumHeight);
            setIsTruncated(maximumHeight > minimumHeight);

            commentsGroupRef.current?.style.setProperty('max-height', `${minimumHeight}px`);
        }
    }, []);

    return (
        <Alert
            type={AlertTypeOption.HIGHLIGHT}
            description={
                <div className={DISPUTE_DATA_ISSUER_COMMENTS_ALERT}>
                    <Typography el={TypographyElement.DIV} variant={TypographyVariant.BODY} strongest>
                        {i18n.get('disputes.management.details.issuerComment')}
                    </Typography>

                    <div
                        className={cx(DISPUTE_DATA_ISSUER_COMMENTS, {
                            [DISPUTE_DATA_ISSUER_COMMENTS_EXPANDED]: isExpanded,
                            [DISPUTE_DATA_ISSUER_COMMENTS_TRUNCATED]: isTruncated,
                        })}
                    >
                        <ul ref={commentsGroupRef} className={DISPUTE_DATA_ISSUER_COMMENTS_GROUP}>
                            {issuerComments.map((issuerComment, index) => (
                                <li key={index}>
                                    <Typography
                                        className={DISPUTE_DATA_ISSUER_COMMENT}
                                        el={TypographyElement.PARAGRAPH}
                                        variant={TypographyVariant.BODY}
                                    >
                                        {/* [NOTE]: Issuer comments are not translated at the moment (maybe never) */}
                                        {issuerComment}
                                    </Typography>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {isTruncated && (
                        <Button variant={ButtonVariant.TERTIARY} onClick={onButtonClick}>
                            {i18n.get(
                                isExpanded
                                    ? 'disputes.management.details.issuerComment.showLess'
                                    : 'disputes.management.details.issuerComment.showMore'
                            )}
                        </Button>
                    )}
                </div>
            }
        />
    );
};
