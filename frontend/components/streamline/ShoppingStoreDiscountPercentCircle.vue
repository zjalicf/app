<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,0a7,7,0,1,0,7,7A7,7,0,0,0,7,0ZM4.75,3.75a1,1,0,1,1-1,1A1,1,0,0,1,4.75,3.75Zm.53,6a.75.75,0,0,1-1.06,0,.75.75,0,0,1,0-1.06l4.5-4.5A.75.75,0,0,1,9.78,5.28Zm4,.47a1,1,0,1,1,1-1A1,1,0,0,1,9.25,10.25Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'ShoppingStoreDiscountPercentCircle',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
