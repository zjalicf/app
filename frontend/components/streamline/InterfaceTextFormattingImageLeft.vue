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
                d="M8.75,1.88h4.5A.76.76,0,0,0,14,1.12a.75.75,0,0,0-.75-.74H8.75A.75.75,0,0,0,8,1.12.76.76,0,0,0,8.75,1.88Z"
            />
            <path
                d="M13.25,4.38H8.75A.75.75,0,0,0,8,5.12a.76.76,0,0,0,.75.76h4.5A.76.76,0,0,0,14,5.12.75.75,0,0,0,13.25,4.38Z"
            />
            <path
                d="M13.25,12.38H.75a.75.75,0,0,0-.75.74.76.76,0,0,0,.75.76h12.5a.76.76,0,0,0,.75-.76A.75.75,0,0,0,13.25,12.38Z"
            />
            <path
                d="M13.25,8.38H.75A.75.75,0,0,0,0,9.12a.76.76,0,0,0,.75.76h12.5A.76.76,0,0,0,14,9.12.75.75,0,0,0,13.25,8.38Z"
            />
            <rect y="0.13" width="6.5" height="6.5" rx="1" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceTextFormattingImageLeft',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
