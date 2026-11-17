<script setup lang="ts">
import { createBackgroundComposition } from './createBackgroundComposition';
import styles from './PietBackground.module.scss';

const LINE_WIDTH = 0.5;

// A new composition every time the component is mounted, always in the same style.
const { cells, lines } = createBackgroundComposition();
</script>

<!--
    Decorative, minimalist composition in the style of Piet Mondrian, in shades of green: a few colored blocks divided by
    thin dark lines. It fills its container (cropped, never stretched) and sits behind the content.
-->
<template>
    <svg
        :class="styles.root"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        shape-rendering="crispEdges"
        aria-hidden="true"
        focusable="false"
        data-testid="piet-background"
    >
        <rect width="100" height="100" :class="styles.paper" />

        <rect
            v-for="cell in cells"
            :key="`${cell.x}-${cell.y}`"
            :x="cell.x"
            :y="cell.y"
            :width="cell.width"
            :height="cell.height"
            :class="styles[cell.tone]"
        />

        <g :class="styles.lines">
            <template v-for="line in lines" :key="`${line.orientation}-${line.position}`">
                <rect v-if="line.orientation === 'vertical'" :x="line.position - LINE_WIDTH / 2" y="0" :width="LINE_WIDTH" height="100" />
                <rect v-else x="0" :y="line.position - LINE_WIDTH / 2" width="100" :height="LINE_WIDTH" />
            </template>
        </g>
    </svg>
</template>
