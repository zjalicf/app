<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13,3H9a1,1,0,0,0-.71,1.7L9.41,5.83a.25.25,0,0,1,0,.36L7.67,7.91a.24.24,0,0,1-.35,0L5.56,6.14a1.5,1.5,0,0,0-2.12,0L.28,9.27a1,1,0,0,0,0,1.41A1,1,0,0,0,1,11a1,1,0,0,0,.7-.29L4.32,8.08a.24.24,0,0,1,.35,0L6.43,9.85a1.5,1.5,0,0,0,2.12,0L10.82,7.6a.25.25,0,0,1,.35,0l1.12,1.12A1,1,0,0,0,13,9,1.07,1.07,0,0,0,13.38,9,1,1,0,0,0,14,8V4A1,1,0,0,0,13,3Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'MoneyGraphArrowIncrease',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
