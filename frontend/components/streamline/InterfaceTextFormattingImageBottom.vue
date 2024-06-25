<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <path d="M.75,5.5h9a.75.75,0,0,0,0-1.5h-9a.75.75,0,0,0,0,1.5Z" />
            <path
                d="M.75,1.5h12.5A.76.76,0,0,0,14,.75.76.76,0,0,0,13.25,0H.75A.76.76,0,0,0,0,.75.76.76,0,0,0,.75,1.5Z"
            />
            <rect y="8" width="14" height="6" rx="1" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceTextFormattingImageBottom',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
