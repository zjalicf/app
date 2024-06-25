<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 11"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M11.0924 0.046875H2.90762C1.30178 0.046875 0 1.34866 0 2.9545V7.04601C0 8.65184 1.30178 9.95363 2.90762 9.95363H11.0924C12.6982 9.95363 14 8.65184 14 7.04601V2.9545C14 1.34866 12.6982 0.046875 11.0924 0.046875ZM9.12598 5.19932L5.2977 7.02518C5.19569 7.07383 5.07786 6.99945 5.07786 6.88645V3.12061C5.07786 3.006 5.19879 2.93172 5.30101 2.98353L9.12929 4.92351C9.24311 4.98118 9.24113 5.14441 9.12598 5.19932Z"
            fill="#F61C0D"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceYoutube',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
