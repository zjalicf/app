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
                d="M.22,10.78a.75.75,0,0,1,0-1.06L8,1.93a.26.26,0,0,0,.06-.28.25.25,0,0,0-.23-.15H5.75A.76.76,0,0,1,5,.75.76.76,0,0,1,5.75,0h4.5a.74.74,0,0,1,.69.46.74.74,0,0,1-.16.82l-9.5,9.5A.75.75,0,0,1,.22,10.78Z"
            />
            <path
                d="M9,13.25a.75.75,0,0,1-.75.75H3.75a.74.74,0,0,1-.69-.46.75.75,0,0,1,.16-.82l9.5-9.5a.75.75,0,1,1,1.06,1.06L6,12.07a.28.28,0,0,0-.06.28.25.25,0,0,0,.23.15H8.25A.75.75,0,0,1,9,13.25Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsDataTransferDiagonal',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
