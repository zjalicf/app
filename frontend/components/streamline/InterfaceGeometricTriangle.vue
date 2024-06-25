<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13.85,11.21l-6-9.5h0a1.1,1.1,0,0,0-1.76,0l-6,9.5a1,1,0,0,0,0,1,1.06,1.06,0,0,0,.89.49H13a1.06,1.06,0,0,0,.89-.49A1,1,0,0,0,13.85,11.21Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceGeometricTriangle',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
