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
                d="M.51,7.12l-.5-3a.75.75,0,0,1,1.48-.24l.5,3a.75.75,0,1,1-1.48.24Z"
            />
            <path
                d="M3.51,7.12l-.5-3a.75.75,0,1,1,1.48-.24l.5,3a.75.75,0,1,1-1.48.24Z"
            />
            <path
                d="M9.63,10.74A.75.75,0,0,1,9,9.88l.5-3A.75.75,0,1,1,11,7.12l-.5,3A.75.75,0,0,1,9.63,10.74Z"
            />
            <path
                d="M12.63,10.74A.75.75,0,0,1,12,9.88l.5-3A.75.75,0,0,1,14,7.12l-.5,3A.75.75,0,0,1,12.63,10.74Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceTextFormattingQuotation4',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
