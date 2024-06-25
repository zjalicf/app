<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,0a7,7,0,1,0,7,7A7,7,0,0,0,7,0ZM6,9.5a1,1,0,0,1-2,0v-5a1,1,0,0,1,2,0Zm4,0a1,1,0,0,1-2,0v-5a1,1,0,0,1,2,0Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'EntertainmentControlButtonPauseCircle',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
