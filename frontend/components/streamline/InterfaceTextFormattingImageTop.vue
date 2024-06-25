<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <path d="M9.75,12.5h-9a.75.75,0,0,0,0,1.5h9a.75.75,0,0,0,0-1.5Z" />
            <path
                d="M13.25,8.5H.75a.75.75,0,0,0,0,1.5h12.5a.75.75,0,0,0,0-1.5Z"
            />
            <rect width="14" height="6" rx="1" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceTextFormattingImageTop',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
