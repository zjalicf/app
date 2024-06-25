<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13.85,11.35a.48.48,0,0,0,0-.7L10.13,6.93a.27.27,0,0,1,0-.36l1.72-1.72a1.49,1.49,0,0,0-.69-2.51L1.86,0A1.53,1.53,0,0,0,.44.44,1.52,1.52,0,0,0,0,1.86l2.3,9.3a1.49,1.49,0,0,0,2.51.69l1.72-1.72a.27.27,0,0,1,.36,0l3.72,3.72a.48.48,0,0,0,.7,0Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceCursorArrow1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
