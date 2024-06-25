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
                d="M7,4.5a1,1,0,0,1-.69-.28L3.23,1.29a.75.75,0,1,1,1-1.08L6.83,2.65a.25.25,0,0,0,.34,0L9.73.21a.75.75,0,1,1,1,1.08L7.69,4.22A1,1,0,0,1,7,4.5Z"
            />
            <path
                d="M10.25,14a.75.75,0,0,1-.52-.21L7.17,11.35a.25.25,0,0,0-.34,0L4.27,13.79a.75.75,0,0,1-1-1.08L6.31,9.78a1,1,0,0,1,1.38,0l3.08,2.93A.75.75,0,0,1,10.25,14Z"
            />
            <path d="M13.25,7.75h-2a.75.75,0,0,1,0-1.5h2a.75.75,0,0,1,0,1.5Z" />
            <path d="M8,7.75H6a.75.75,0,0,1,0-1.5H8a.75.75,0,0,1,0,1.5Z" />
            <path d="M2.75,7.75h-2a.75.75,0,0,1,0-1.5h2a.75.75,0,0,1,0,1.5Z" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceEditFlipVertical1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
