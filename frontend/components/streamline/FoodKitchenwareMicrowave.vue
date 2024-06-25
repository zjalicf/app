<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,3a1,1,0,0,0-1-1H1A1,1,0,0,0,0,3v8a1,1,0,0,0,1,1H13a1,1,0,0,0,1-1ZM9,9a1,1,0,0,1-1,1H2.5a1,1,0,0,1-1-1V5a1,1,0,0,1,1-1H8A1,1,0,0,1,9,5Zm3-.75H11a.75.75,0,0,1,0-1.5h1a.75.75,0,0,1,0,1.5Zm0-2.5H11a.75.75,0,0,1,0-1.5h1a.75.75,0,0,1,0,1.5Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'FoodKitchenwareMicrowave',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
