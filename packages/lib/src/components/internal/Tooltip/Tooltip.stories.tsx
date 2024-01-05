import { Tooltip } from '@src/components/internal/Tooltip/Tooltip';

export const TooltipStories = () => {
    const buttonStyle = {
        background: '#d4d9db',
        color: '#000',
        padding: '20px',
        fontSize: '18px',
        border: 'none',
        borderRadius: '5px',
    };
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                width: '100%',
                left: 0,
                top: 0,
                zIndex: 20,
                background: '#f0f0f0',
                padding: '10px',
                gap: '80px',
            }}
        >
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                <Tooltip position={'top'} content={'This will appear on the right, as there is not enough space on the left'}>
                    <button style={buttonStyle}>{'Top (defaults to right)'}</button>
                </Tooltip>
                <Tooltip position={'top'} content={'This will appear on the bottom as there is not enough space for it to appear on top'}>
                    <button style={buttonStyle}>{'Top (defaults to bottom)'}</button>
                </Tooltip>
                <Tooltip position={'bottom'} content={'There is space :)'}>
                    <button style={buttonStyle}>{'Bottom'}</button>
                </Tooltip>
            </div>
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', gap: '20px' }}>
                <Tooltip position={'top'} content={'This will appear on the right, as there is not enough space on the left'}>
                    <button style={buttonStyle}>{'Top (defaults to right)'}</button>
                </Tooltip>
                <Tooltip position={'top'} content={'This will appear on the top'}>
                    <button style={buttonStyle}>{'Top'}</button>
                </Tooltip>
                <Tooltip position={'bottom'} content={'This will appear on the bottom'}>
                    <button style={buttonStyle}>{'Bottom'}</button>
                </Tooltip>
                <Tooltip position={'bottom'} content={'This will appear on the left, as there is not enough space on the right'}>
                    <button style={buttonStyle}>{'Bottom (defaults to left)'}</button>
                </Tooltip>
            </div>
            <div style={{ display: 'flex', width: '100%', justifyContent: 'center', gap: '20px' }}>
                <Tooltip position={'top'} content={<span>{'Not only text'}</span>}>
                    <button style={buttonStyle}>{'Content with html'}</button>
                </Tooltip>
            </div>
            <div style={{ margin: 'auto auto 0 auto' }}>
                <Tooltip position={'bottom'} content={'This will appear on the top, as there is not enough space for it to appear on bottom'}>
                    <button style={buttonStyle}>{'Bottom (defaults to top)'}</button>
                </Tooltip>
            </div>
        </div>
    );
};
