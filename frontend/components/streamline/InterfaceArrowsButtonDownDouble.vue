<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <path
                d="M13.71,6.5a1,1,0,0,0-1.42,0L7.18,11.62a.27.27,0,0,1-.36,0L1.71,6.5a1,1,0,0,0-1.42,0,1,1,0,0,0,0,1.41l5.65,5.65a1.49,1.49,0,0,0,2.12,0l5.65-5.65A1,1,0,0,0,13.71,6.5Z"
            />
            <path
                d="M12.29.29,7.18,5.41a.25.25,0,0,1-.36,0L1.71.29A1,1,0,0,0,.29,1.71L5.94,7.35a1.49,1.49,0,0,0,2.12,0l5.65-5.64A1,1,0,1,0,12.29.29Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsButtonDownDouble',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
