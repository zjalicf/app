<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,14a7,7,0,1,1,7-7A7,7,0,0,1,7,14ZM7,2a5,5,0,1,0,5,5A5,5,0,0,0,7,2Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'EntertainmentControlButtonRecord3Alternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
