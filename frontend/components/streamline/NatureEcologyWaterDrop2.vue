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
                d="M7,9.65a3.46,3.46,0,0,0,3.46-3.46c0-1.51-2.14-4.69-3.05-6a.51.51,0,0,0-.82,0c-.91,1.29-3,4.47-3,6A3.46,3.46,0,0,0,7,9.65Z"
            />
            <path
                d="M7,14A7.87,7.87,0,0,1,.1,10.63a.75.75,0,0,1,1.3-.76A6.39,6.39,0,0,0,7,12.5a6.42,6.42,0,0,0,5.6-2.63.75.75,0,0,1,1.3.76A7.87,7.87,0,0,1,7,14Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'NatureEcologyWaterDrop2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
