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
                d="M10.75,5.6A1,1,0,0,1,10,5.3L7.18,2.44a.25.25,0,0,0-.36,0L4,5.3a1,1,0,0,1-1.42,0,1,1,0,0,1,0-1.41L6,.4A1.36,1.36,0,0,1,8,.4l3.5,3.49a1,1,0,0,1,0,1.41A1,1,0,0,1,10.75,5.6Z"
            />
            <path
                d="M7,14a1.32,1.32,0,0,1-1-.4l-3.5-3.49a1,1,0,0,1,0-1.41A1,1,0,0,1,4,8.7l2.86,2.86a.25.25,0,0,0,.36,0L10,8.7a1,1,0,0,1,1.42,0,1,1,0,0,1,0,1.41L8,13.6A1.32,1.32,0,0,1,7,14Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsVerticalExpand1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
