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
                d="M12.25,14H1.75A1.76,1.76,0,0,1,0,12.25V1.75A1.76,1.76,0,0,1,1.75,0h10.5A1.76,1.76,0,0,1,14,1.75v10.5A1.76,1.76,0,0,1,12.25,14ZM1.75,1.5a.25.25,0,0,0-.25.25v10.5a.25.25,0,0,0,.25.25h10.5a.25.25,0,0,0,.25-.25V1.75a.25.25,0,0,0-.25-.25Z"
            />
            <path
                d="M4.75,10a.74.74,0,0,1-.53-.22.75.75,0,0,1,0-1.06l4.5-4.5A.75.75,0,0,1,9.78,5.28l-4.5,4.5A.74.74,0,0,1,4.75,10Z"
            />
            <circle cx="5" cy="5" r="1" />
            <circle cx="9" cy="9" r="1" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ShoppingStoreDiscountPercentSquareAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
