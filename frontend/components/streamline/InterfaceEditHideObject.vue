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
                d="M4.28,12.78a.26.26,0,0,0,0,.4,6.51,6.51,0,0,0,8.85-8.85.26.26,0,0,0-.4,0Z"
            />
            <path
                d="M13.78.22a.75.75,0,0,0-1.06,0L11.09,1.85a.26.26,0,0,1-.31,0A6.39,6.39,0,0,0,7.5,1,6.5,6.5,0,0,0,1,7.5a6.39,6.39,0,0,0,.89,3.28.26.26,0,0,1,0,.31L.22,12.72a.75.75,0,0,0,0,1.06.75.75,0,0,0,1.06,0l12.5-12.5A.75.75,0,0,0,13.78.22Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceEditHideObject',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
