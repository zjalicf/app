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
                d="M7,0a7,7,0,1,0,7,7A7,7,0,0,0,7,0ZM7,12.5A5.5,5.5,0,1,1,12.5,7,5.51,5.51,0,0,1,7,12.5Z"
            />
            <path
                d="M8.58,3.62,7.2,5.46a.25.25,0,0,1-.4,0L5.42,3.62a.62.62,0,0,0-.87-.12.63.63,0,0,0-.13.88l1.9,2.53a.22.22,0,0,1,.06.15v.62a.26.26,0,0,1-.26.25H5.38a.63.63,0,0,0,0,1.25h.74a.26.26,0,0,1,.26.25v.82a.62.62,0,1,0,1.24,0V9.43a.26.26,0,0,1,.26-.25h.74a.63.63,0,0,0,0-1.25H7.88a.26.26,0,0,1-.26-.25V7.06a.22.22,0,0,1,.06-.15l1.9-2.53a.63.63,0,0,0-.13-.88A.62.62,0,0,0,8.58,3.62Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'MoneyCurrencyYuanCircleAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
