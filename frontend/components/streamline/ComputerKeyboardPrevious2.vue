<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,1.5A1.5,1.5,0,0,0,12.5,0H1.5A1.5,1.5,0,0,0,0,1.5v11A1.5,1.5,0,0,0,1.5,14h11A1.5,1.5,0,0,0,14,12.5ZM4,9.5a.75.75,0,0,1-1.5,0v-5A.75.75,0,0,1,4,4.5Zm7.25-1.75h-2A.25.25,0,0,0,9,8V9a.74.74,0,0,1-.46.69.74.74,0,0,1-.82-.16l-2-2a.75.75,0,0,1,0-1.06l2-2a.75.75,0,0,1,.82-.16A.74.74,0,0,1,9,5V6a.25.25,0,0,0,.25.25h2a.75.75,0,0,1,0,1.5Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'ComputerKeyboardPrevious2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
