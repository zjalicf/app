<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13.62,9.73a.74.74,0,0,0,0-1.06L7.11,2.16a.37.37,0,0,0-.29-.1l-3.09.47a.26.26,0,0,1-.21-.07L1.44.38A.74.74,0,0,0,.38.38a.74.74,0,0,0,0,1.06L2.46,3.52a.26.26,0,0,1,.07.21L2.05,6.82a.42.42,0,0,0,.11.29l6.51,6.51a.74.74,0,0,0,1.06,0ZM5.15,6.15a1,1,0,1,1,1-1A1,1,0,0,1,5.15,6.15Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'MoneyCashierTag',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
