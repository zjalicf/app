<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,1.75A1.76,1.76,0,0,0,12.25,0h-4A.76.76,0,0,0,7.5.75a.76.76,0,0,0,.75.75h4a.25.25,0,0,1,.25.25v7.5a.25.25,0,0,1-.25.25H4.75a.25.25,0,0,1-.25-.25v-2A.74.74,0,0,0,4,6.56a.75.75,0,0,0-.82.16l-3,3a.75.75,0,0,0,0,1.06l3,3a.74.74,0,0,0,.82.16.74.74,0,0,0,.46-.69v-2A.25.25,0,0,1,4.75,11h7.5A1.76,1.76,0,0,0,14,9.25Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'ComputerKeyboardReturn1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
