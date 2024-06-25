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
                d="M9.06,10.5H1a1,1,0,0,1,0-2H8.4a.25.25,0,0,0,.25-.22l.8-6A1.51,1.51,0,0,1,10.94,1H13a1,1,0,0,1,0,2H11.6a.25.25,0,0,0-.25.22l-.8,6A1.51,1.51,0,0,1,9.06,10.5Zm-.5-1.57h0Zm2.88-6.37h0Z"
            />
            <circle cx="2" cy="13" r="1" />
            <circle cx="8.5" cy="13" r="1" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ShoppingCartHeavy',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
