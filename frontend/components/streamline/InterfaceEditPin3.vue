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
                d="M4.35,8.63a.25.25,0,0,0-.18-.1A.27.27,0,0,0,4,8.61L.29,12.29a1,1,0,0,0,1.42,1.42L5.39,10a.27.27,0,0,0,.08-.19.25.25,0,0,0-.1-.18A6.15,6.15,0,0,1,4.35,8.63Z"
            />
            <path
                d="M9.25,0A4.75,4.75,0,1,0,14,4.75,4.75,4.75,0,0,0,9.25,0ZM9,4a1,1,0,1,1,1-1A1,1,0,0,1,9,4Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceEditPin3',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
