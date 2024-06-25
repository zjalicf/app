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
                d="M.85,3.15A.47.47,0,0,0,.31,3,.5.5,0,0,0,0,3.5v7A.5.5,0,0,0,.31,11a.48.48,0,0,0,.54-.11l3.5-3.5a.48.48,0,0,0,0-.7Z"
            />
            <path
                d="M13.69,3a.47.47,0,0,0-.54.11l-3.5,3.5a.48.48,0,0,0,0,.7l3.5,3.5a.48.48,0,0,0,.54.11A.5.5,0,0,0,14,10.5v-7A.5.5,0,0,0,13.69,3Z"
            />
            <path
                d="M7,0a.76.76,0,0,0-.75.75v2a.75.75,0,0,0,1.5,0v-2A.76.76,0,0,0,7,0Z"
            />
            <path
                d="M7,5.25A.76.76,0,0,0,6.25,6V8a.75.75,0,0,0,1.5,0V6A.76.76,0,0,0,7,5.25Z"
            />
            <path
                d="M7,10.5a.76.76,0,0,0-.75.75v2a.75.75,0,0,0,1.5,0v-2A.76.76,0,0,0,7,10.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceEditFlipHorizontal1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
