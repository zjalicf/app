<template>
    <svg
        viewBox="0 0 14 14"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            id="Subtract"
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M0.192675 6.23394C-0.0642251 6.71126 -0.0642248 7.28874 0.192675 7.76607C1.5553 10.2979 4.09364 12 7 12C9.90636 12 12.4447 10.2979 13.8073 7.76607C14.0642 7.28874 14.0642 6.71126 13.8073 6.23393C12.4447 3.70214 9.90636 2 7 2C4.09364 2 1.5553 3.70214 0.192675 6.23394ZM7 9C8.10457 9 9 8.10457 9 7C9 5.89543 8.10457 5 7 5C5.89543 5 5 5.89543 5 7C5 8.10457 5.89543 9 7 9Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'IconVisibilityOn',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
