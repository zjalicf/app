<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,0a7,7,0,1,0,7,7A7,7,0,0,0,7,0ZM4.29,3.91,6.54,2.16a.75.75,0,0,1,.92,0L9.71,3.91a.74.74,0,0,1,.13,1,.75.75,0,0,1-.59.29.74.74,0,0,1-.46-.16L7.15,3.82a.24.24,0,0,0-.3,0L5.21,5.09a.75.75,0,0,1-.92-1.18ZM8,7A1,1,0,1,1,7,6,1,1,0,0,1,8,7ZM2.75,7a1,1,0,1,1,1,1A1,1,0,0,1,2.75,7Zm7,3.09L7.46,11.84a.74.74,0,0,1-.92,0L4.29,10.09a.75.75,0,1,1,.92-1.18l1.64,1.27a.24.24,0,0,0,.3,0L8.79,8.91a.75.75,0,0,1,.92,1.18ZM10.25,8a1,1,0,1,1,1-1A1,1,0,0,1,10.25,8Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'MoneyCurrencyBinanceCircle',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
