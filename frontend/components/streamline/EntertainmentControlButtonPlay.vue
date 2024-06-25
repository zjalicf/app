<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13.13,5.61,2.24.16A1.62,1.62,0,0,0,1.55,0,1.54,1.54,0,0,0,0,1.54V12.46A1.54,1.54,0,0,0,1.55,14a1.62,1.62,0,0,0,.69-.16L13.13,8.39a1.55,1.55,0,0,0,0-2.78Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'EntertainmentControlButtonPlay',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
