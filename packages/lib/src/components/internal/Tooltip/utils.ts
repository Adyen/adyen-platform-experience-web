import { TooltipPosition } from './types';

const ARROW_HEIGHT = 4;
const TOOLTIP_GAP = 6;

interface TooltipDimensions {
    width: number;
    height: number;
}

interface Position {
    top: number;
    left: number;
    arrowVertical: number;
    arrowHorizontal: number;
}

interface Positions {
    top: Position;
    bottom: Position;
    right: Position;
    left: Position;
}

const calculateHorizontalCenter = (controllerRect: DOMRect, tooltipWidth: number): number =>
    controllerRect.left + window.scrollX + controllerRect.width / 2 - tooltipWidth / 2;

const calculateVerticalCenter = (controllerRect: DOMRect, tooltipHeight: number): number =>
    controllerRect.top - (tooltipHeight / 2 - controllerRect.height / 2);

const calculatePositions = (controllerRect: DOMRect, tooltip: TooltipDimensions): Positions => {
    const horizontalCenter = calculateHorizontalCenter(controllerRect, tooltip.width);
    const verticalCenter = calculateVerticalCenter(controllerRect, tooltip.height);

    const arrowVerticalCenter = verticalCenter + tooltip.height / 2 - TOOLTIP_GAP + ARROW_HEIGHT / 2;
    const arrowHorizontalCenter = horizontalCenter + tooltip.width / 2;

    const topPosition = controllerRect.top - controllerRect.height - ARROW_HEIGHT - TOOLTIP_GAP - (tooltip.height - controllerRect.height);
    const bottomPosition = controllerRect.top + controllerRect.height + TOOLTIP_GAP + ARROW_HEIGHT;
    const rightPosition = controllerRect.left + controllerRect.width + ARROW_HEIGHT + TOOLTIP_GAP;
    const leftPosition = controllerRect.left - tooltip.width - ARROW_HEIGHT - TOOLTIP_GAP;

    return {
        top: {
            top: topPosition,
            left: horizontalCenter,
            arrowVertical: topPosition + tooltip.height - ARROW_HEIGHT,
            arrowHorizontal: arrowHorizontalCenter,
        },
        bottom: { top: bottomPosition, left: horizontalCenter, arrowVertical: bottomPosition - ARROW_HEIGHT, arrowHorizontal: arrowHorizontalCenter },
        right: { top: verticalCenter, left: rightPosition, arrowVertical: arrowVerticalCenter, arrowHorizontal: rightPosition - ARROW_HEIGHT },
        left: {
            top: verticalCenter,
            left: leftPosition,
            arrowVertical: arrowVerticalCenter,
            arrowHorizontal: leftPosition + tooltip.width - ARROW_HEIGHT,
        },
    };
};

export const calculateTooltipPosition = ({
    position,
    controllerRect,
    tooltip,
}: {
    position: TooltipPosition;
    controllerRect: DOMRect;
    tooltip: TooltipDimensions;
}): Position => {
    const positions = calculatePositions(controllerRect, tooltip);

    switch (position) {
        case 'top':
        case 'bottom':
            if (tooltip.width / 2 > controllerRect.left + controllerRect.width / 2) return positions.right;
            if (tooltip.width / 2 > window.innerWidth - controllerRect.right + controllerRect.width / 2) return positions.left;
            if (tooltip.height + ARROW_HEIGHT + controllerRect.height > window.innerHeight - controllerRect.top) return positions.top;
            if (tooltip.height + TOOLTIP_GAP > controllerRect.top) return positions.bottom;
            return positions[position];
        case 'left':
            if (tooltip.width + ARROW_HEIGHT + TOOLTIP_GAP > controllerRect.left) return positions.right;
            return positions.left;
        case 'right':
            if (tooltip.width + ARROW_HEIGHT + TOOLTIP_GAP > window.innerWidth - controllerRect.right) return positions.left;
            return positions.right;
        default:
            return positions.top;
    }
};
