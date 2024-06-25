<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M10,14a1,1,0,0,1-1-1V4A2,2,0,0,0,5,4,1,1,0,0,1,3,4a4,4,0,0,1,8,0v9A1,1,0,0,1,10,14Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'ShoppingClothAccessoriesCane',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
