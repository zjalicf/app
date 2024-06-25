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
                d="M9.75,0H4.25A2.75,2.75,0,0,0,1.5,2.75v8.5A2.75,2.75,0,0,0,4.25,14h5.5a2.75,2.75,0,0,0,2.75-2.75V2.75A2.75,2.75,0,0,0,9.75,0ZM4.25,1.5h5.5A1.25,1.25,0,0,1,11,2.75v3a.25.25,0,0,1-.25.25H3.25A.25.25,0,0,1,3,5.75v-3A1.25,1.25,0,0,1,4.25,1.5Zm5.5,11H4.25A1.25,1.25,0,0,1,3,11.25V7.75a.25.25,0,0,1,.25-.25h7.5a.25.25,0,0,1,.25.25v3.5A1.25,1.25,0,0,1,9.75,12.5Z"
            />
            <path
                d="M5,4.75A.76.76,0,0,0,5.75,4V3.5a.75.75,0,0,0-1.5,0V4A.76.76,0,0,0,5,4.75Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'FoodKitchenwareRefrigeratorAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
