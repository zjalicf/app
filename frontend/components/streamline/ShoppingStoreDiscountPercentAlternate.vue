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
                d="M3,6A3,3,0,1,1,6,3,3,3,0,0,1,3,6ZM3,1.5A1.5,1.5,0,1,0,4.5,3,1.5,1.5,0,0,0,3,1.5Z"
            />
            <path
                d="M11,14a3,3,0,1,1,3-3A3,3,0,0,1,11,14Zm0-4.5A1.5,1.5,0,1,0,12.5,11,1.5,1.5,0,0,0,11,9.5Z"
            />
            <path
                d="M.75,14a.74.74,0,0,1-.53-.22.75.75,0,0,1,0-1.06L12.72.22a.75.75,0,0,1,1.06,1.06L1.28,13.78A.74.74,0,0,1,.75,14Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ShoppingStoreDiscountPercentAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
