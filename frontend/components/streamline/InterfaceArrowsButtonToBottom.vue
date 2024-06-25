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
                d="M7,12.9a1.51,1.51,0,0,1-1.06-.44L.29,6.81a1,1,0,0,1,0-1.41,1,1,0,0,1,1.42,0l5.11,5.11a.25.25,0,0,0,.36,0L12.29,5.4a1,1,0,0,1,1.42,0,1,1,0,0,1,0,1.41L8.06,12.46A1.51,1.51,0,0,1,7,12.9Z"
            />
            <path d="M13,3.1H1a1,1,0,0,1,0-2H13a1,1,0,0,1,0,2Z" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsButtonToBottom',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
