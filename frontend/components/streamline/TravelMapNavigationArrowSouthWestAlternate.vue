<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M12.8,13.12a1.09,1.09,0,0,1-.46-.1L.71,8.1a1.21,1.21,0,0,1,0-2.2L12.34,1a1.19,1.19,0,0,1,1.51,1.67l-2.3,4.23a.25.25,0,0,0,0,.24l2.3,4.23a1.19,1.19,0,0,1-.16,1.38A1.22,1.22,0,0,1,12.8,13.12ZM2.49,6.77a.25.25,0,0,0,0,.46l9,3.79a.23.23,0,0,0,.28-.06.24.24,0,0,0,0-.29L10,7.47a1,1,0,0,1,0-.93l1.75-3.21a.24.24,0,0,0,0-.29A.23.23,0,0,0,11.46,3Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'TravelMapNavigationArrowSouthWestAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
