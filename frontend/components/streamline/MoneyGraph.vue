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
                d="M14,13.25a.76.76,0,0,0-.75-.75H1.75a.25.25,0,0,1-.25-.25V.75A.76.76,0,0,0,.75,0,.76.76,0,0,0,0,.75v12.5A.76.76,0,0,0,.75,14h12.5A.76.76,0,0,0,14,13.25Z"
            />
            <path
                d="M5.51,8.67A1,1,0,0,0,6.25,9h.09a1,1,0,0,0,.76-.47l3-4.79a.25.25,0,0,1,.17-.11.25.25,0,0,1,.2.06l1.9,1.58a1,1,0,0,0,1.28-1.54l-3-2.5a1,1,0,0,0-1.49.24L6.28,6.06a.25.25,0,0,1-.4,0L4.74,4.83A1,1,0,0,0,3.26,6.17Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'MoneyGraph',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
