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
                d="M7,6.1a1.41,1.41,0,0,1-1-.4l-4-4A1,1,0,0,1,3.46.29L6.82,3.66a.27.27,0,0,0,.36,0L10.54.29A1,1,0,0,1,12,1.71l-4,4A1.41,1.41,0,0,1,7,6.1Z"
            />
            <path
                d="M7,7.9a1.41,1.41,0,0,1,1,.4l4,4a1,1,0,0,1-1.41,1.42L7.18,10.34a.27.27,0,0,0-.36,0L3.46,13.71a1,1,0,0,1-1.41-1.42l4-4A1.41,1.41,0,0,1,7,7.9Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsShrinkVertical',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
