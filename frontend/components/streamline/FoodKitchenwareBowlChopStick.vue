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
                d="M13.5,6.5H.5A.5.5,0,0,0,0,7,7,7,0,0,0,14,7,.5.5,0,0,0,13.5,6.5Z"
            />
            <path
                d="M5.53,5.09A.77.77,0,0,1,5.41,4l3-3.75A.76.76,0,0,1,9.47.16a.77.77,0,0,1,.12,1.06L6.59,5A.76.76,0,0,1,5.53,5.09Z"
            />
            <path
                d="M8.36,5.14a.74.74,0,0,1,.25-1l3.25-2a.75.75,0,0,1,.78,1.28l-3.25,2A.74.74,0,0,1,8.36,5.14Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'FoodKitchenwareBowlChopStick',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
