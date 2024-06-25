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
                d="M6,4.5a.25.25,0,0,0,.25-.25v-4A.25.25,0,0,0,6,0H3.62A1.74,1.74,0,0,0,2.05,1L.47,4.14a.23.23,0,0,0,0,.24.22.22,0,0,0,.21.12Z"
            />
            <path
                d="M7.75,4.25A.25.25,0,0,0,8,4.5h5.31a.22.22,0,0,0,.21-.12.23.23,0,0,0,0-.24L12,1a1.74,1.74,0,0,0-1.57-1H8a.25.25,0,0,0-.25.25Z"
            />
            <path
                d="M.25,6A.25.25,0,0,0,0,6.25v6A1.76,1.76,0,0,0,1.75,14h10.5A1.76,1.76,0,0,0,14,12.25v-6A.25.25,0,0,0,13.75,6Zm10.5,5.5h-2a.75.75,0,0,1,0-1.5h2a.75.75,0,0,1,0,1.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ShippingBox2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
