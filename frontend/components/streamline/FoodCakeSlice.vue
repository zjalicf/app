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
                d="M14,8a1,1,0,0,0-1-1H1A1,1,0,0,0,0,8V9a.25.25,0,0,0,.25.25h13.5A.25.25,0,0,0,14,9Z"
            />
            <path
                d="M0,13a1,1,0,0,0,1,1H13a1,1,0,0,0,1-1V11a.25.25,0,0,0-.25-.25H.25A.25.25,0,0,0,0,11Z"
            />
            <path
                d="M3.5,5.5a2,2,0,0,0,2-2A2,2,0,0,0,4.41,1.73a.29.29,0,0,1-.13-.16.3.3,0,0,1,0-.21A.79.79,0,0,1,5,1,.5.5,0,0,0,5.5.5.5.5,0,0,0,5,0,1.86,1.86,0,0,0,3.2,1.4.26.26,0,0,1,3,1.56,2,2,0,0,0,3.5,5.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'FoodCakeSlice',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
