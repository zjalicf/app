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
                d="M8.75,1.75h4.5A.76.76,0,0,0,14,1a.76.76,0,0,0-.75-.75H8.75A.76.76,0,0,0,8,1,.76.76,0,0,0,8.75,1.75Z"
            />
            <path
                d="M13.25,4.25H8.75a.75.75,0,0,0,0,1.5h4.5a.75.75,0,0,0,0-1.5Z"
            />
            <path
                d="M13.25,12.25H.75a.75.75,0,0,0,0,1.5h12.5a.75.75,0,0,0,0-1.5Z"
            />
            <path
                d="M13.25,8.25H.75a.75.75,0,0,0,0,1.5h12.5a.75.75,0,0,0,0-1.5Z"
            />
            <path
                d="M4.75,6.5h-3A1.76,1.76,0,0,1,0,4.75v-3A1.76,1.76,0,0,1,1.75,0h3A1.76,1.76,0,0,1,6.5,1.75v3A1.76,1.76,0,0,1,4.75,6.5Zm-3-5a.25.25,0,0,0-.25.25v3A.25.25,0,0,0,1.75,5h3A.25.25,0,0,0,5,4.75v-3a.25.25,0,0,0-.25-.25Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceTextFormattingImageLeftAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
