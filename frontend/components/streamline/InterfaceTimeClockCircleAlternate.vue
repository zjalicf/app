<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,0a7,7,0,1,0,7,7A7,7,0,0,0,7,0ZM9.3,9.52a.77.77,0,0,1-.51.19.74.74,0,0,1-.55-.24l-1.79-2A.74.74,0,0,1,6.25,7V4.75a.75.75,0,0,1,1.5,0V6.61a.23.23,0,0,0,.07.17L9.35,8.46A.76.76,0,0,1,9.3,9.52Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceTimeClockCircleAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
