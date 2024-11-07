import cx from 'classnames';

const Icon = ({ className, alt, url }: { className?: string; alt?: string; url: string }) => {
    return (
        <div className="adyen-pe-data-grid__icon-container">
            <img className={cx('adyen-pe-data-grid__icon', className)} alt={alt} src={url} />
        </div>
    );
};

export default Icon;
