<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,13.07,11,.58A.75.75,0,0,0,10.25,0H3.75A.75.75,0,0,0,3,.58L0,13.08A.75.75,0,0,0,.75,14h6.5A.75.75,0,0,0,8,13.42l.54-2.23A.24.24,0,0,1,8.76,11h3a.24.24,0,0,1,.24.19l.54,2.24a.75.75,0,0,0,.73.57l.17,0A.75.75,0,0,0,14,13.07ZM9.22,1.81,6.75,12.12a.5.5,0,0,1-.49.38H2a.26.26,0,0,1-.2-.1.22.22,0,0,1,0-.21L4.25,1.88a.5.5,0,0,1,.49-.38H9a.26.26,0,0,1,.2.1A.22.22,0,0,1,9.22,1.81Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'ShoppingStoreSignage3',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
