<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <circle cx="2" cy="2" r="2" />
            <circle cx="12" cy="12" r="2" />
            <rect
                x="-1.65"
                y="5.43"
                width="17.3"
                height="3.15"
                rx="0.56"
                transform="translate(-2.9 7) rotate(-45)"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ShoppingStoreDiscountPercent',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
