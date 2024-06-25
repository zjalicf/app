<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13.82,5.62,7.32.12a.49.49,0,0,0-.64,0L.18,5.62A.49.49,0,0,0,0,6.19l3,7.5A.49.49,0,0,0,3.5,14h7a.49.49,0,0,0,.46-.31l3-7.5A.49.49,0,0,0,13.82,5.62Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceGeometricPentagon',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
