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
                d="M6,5.13H3A.63.63,0,0,0,3,6.38h.62a.26.26,0,0,1,.26.25V8.75a.62.62,0,1,0,1.24,0V6.63a.26.26,0,0,1,.26-.25H6A.63.63,0,0,0,6,5.13Z"
            />
            <path
                d="M11,5.2a.61.61,0,0,0-.64,0l-1,.68a.28.28,0,0,1-.28,0l-1-.68a.62.62,0,0,0-.64,0,.62.62,0,0,0-.34.55v3a.63.63,0,1,0,1.26,0V7.39a.26.26,0,0,1,.13-.23.25.25,0,0,1,.25,0l.14.09a.64.64,0,0,0,.7,0l.14-.09a.25.25,0,0,1,.25,0,.26.26,0,0,1,.13.23V8.75a.63.63,0,0,0,1.26,0v-3A.62.62,0,0,0,11,5.2Z"
            />
            <path
                d="M7,0a7,7,0,1,0,7,7A7,7,0,0,0,7,0ZM7,12.5A5.5,5.5,0,1,1,12.5,7,5.51,5.51,0,0,1,7,12.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceContentTrademarkAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
