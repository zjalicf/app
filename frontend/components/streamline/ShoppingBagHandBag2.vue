<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,11.45,12.57,5a1.27,1.27,0,0,0-1.22-1h-.59a.25.25,0,0,1-.24-.21l-.16-.94a3.41,3.41,0,0,0-6.72,0l-.16.94A.25.25,0,0,1,3.24,4H2.65A1.27,1.27,0,0,0,1.43,5L.05,11.45A2.09,2.09,0,0,0,2.11,14h9.78A2.09,2.09,0,0,0,14,11.45ZM5.12,3.09a1.91,1.91,0,0,1,3.76,0l.1.62a.28.28,0,0,1-.05.2A.25.25,0,0,1,8.74,4H5.26a.25.25,0,0,1-.19-.09A.28.28,0,0,1,5,3.71Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'ShoppingBagHandBag2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
