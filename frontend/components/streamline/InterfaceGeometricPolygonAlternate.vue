<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M9,14H5a1.5,1.5,0,0,1-1.06-.44l-3.5-3.5A1.5,1.5,0,0,1,0,9V5A1.5,1.5,0,0,1,.44,3.94L3.94.44A1.5,1.5,0,0,1,5,0H9a1.5,1.5,0,0,1,1.06.44l3.5,3.5A1.5,1.5,0,0,1,14,5V9a1.5,1.5,0,0,1-.44,1.06l-3.5,3.5A1.5,1.5,0,0,1,9,14ZM5.13,11.93a.29.29,0,0,0,.18.07H8.69a.29.29,0,0,0,.18-.07l3.06-3.06A.29.29,0,0,0,12,8.69V5.31a.29.29,0,0,0-.07-.18L8.87,2.07A.29.29,0,0,0,8.69,2H5.31a.29.29,0,0,0-.18.07L2.07,5.13A.29.29,0,0,0,2,5.31V8.69a.29.29,0,0,0,.07.18Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceGeometricPolygonAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
