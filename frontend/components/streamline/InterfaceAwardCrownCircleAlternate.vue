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
                d="M11,6a.5.5,0,0,0-.8-.4l-.85.64a.5.5,0,0,1-.66,0L7.35,4.85a.5.5,0,0,0-.7,0L5.31,6.19a.5.5,0,0,1-.66,0L3.8,5.6A.5.5,0,0,0,3,6V8A1.5,1.5,0,0,0,4.5,9.5h5A1.5,1.5,0,0,0,11,8Z"
            />
            <path
                d="M7,14a7,7,0,1,1,7-7A7,7,0,0,1,7,14ZM7,1.5A5.5,5.5,0,1,0,12.5,7,5.51,5.51,0,0,0,7,1.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceAwardCrownCircleAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
