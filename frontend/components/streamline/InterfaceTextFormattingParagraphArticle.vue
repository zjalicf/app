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
                d="M13.25,1.5H5.75A.76.76,0,0,1,5,.75.76.76,0,0,1,5.75,0h7.5A.76.76,0,0,1,14,.75.76.76,0,0,1,13.25,1.5Z"
            />
            <path
                d="M13.25,5.67H.75a.75.75,0,0,1,0-1.5h12.5a.75.75,0,0,1,0,1.5Z"
            />
            <path d="M8.25,14H.75a.75.75,0,0,1,0-1.5h7.5a.75.75,0,0,1,0,1.5Z" />
            <path
                d="M13.25,9.83H.75a.75.75,0,0,1,0-1.5h12.5a.75.75,0,0,1,0,1.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceTextFormattingParagraphArticle',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
