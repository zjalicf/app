<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M10.57,12.25H3.88a3.9,3.9,0,0,1-1-7.68.24.24,0,0,0,.17-.14,4.54,4.54,0,0,1,8.59,1,.23.23,0,0,0,.15.18,3.45,3.45,0,0,1-1.26,6.66Zm-3.35-9A3.08,3.08,0,0,0,4.31,5.43.76.76,0,0,1,3.66,6a2.4,2.4,0,0,0,.22,4.79h6.69a1.95,1.95,0,0,0,.32-3.87.77.77,0,0,1-.63-.71A3,3,0,0,0,7.22,3.25Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'ProgrammingCloudAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
