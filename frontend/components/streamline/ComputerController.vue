<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,6.5A1.5,1.5,0,0,0,12.5,5H8a.25.25,0,0,1-.25-.25v-3a.24.24,0,0,1,.19-.24A.76.76,0,0,0,8.5.75.76.76,0,0,0,7.75,0H6.25A.76.76,0,0,0,5.5.75a.76.76,0,0,0,.56.73.24.24,0,0,1,.19.24v3A.25.25,0,0,1,6,5H1.5A1.5,1.5,0,0,0,0,6.5v6A1.5,1.5,0,0,0,1.5,14h11A1.5,1.5,0,0,0,14,12.5ZM4,11.25A1.75,1.75,0,1,1,5.75,9.5,1.76,1.76,0,0,1,4,11.25Zm6,0A1.75,1.75,0,1,1,11.75,9.5,1.76,1.76,0,0,1,10,11.25Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'ComputerController',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
