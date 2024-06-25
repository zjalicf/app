<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M10.25,3.5a4,4,0,0,0-3,1.93.27.27,0,0,1-.4,0,4,4,0,0,0-3-1.93C1.37,3.5,0,4.78,0,7s1.37,3.5,3.75,3.5A4,4,0,0,0,6.8,8.57a.27.27,0,0,1,.4,0,4,4,0,0,0,3.05,1.93C12.63,10.5,14,9.22,14,7S12.63,3.5,10.25,3.5ZM3.75,9C2.21,9,1.5,8.36,1.5,7s.71-2,2.25-2C4.58,5,5.28,5.84,6,6.86a.24.24,0,0,1,0,.28C5.28,8.16,4.58,9,3.75,9Zm6.5,0C9.42,9,8.72,8.16,8,7.14a.24.24,0,0,1,0-.28C8.72,5.84,9.42,5,10.25,5c1.54,0,2.25.64,2.25,2S11.79,9,10.25,9Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfacePageControllerButtonLoop1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
