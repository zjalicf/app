<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,5.75A1.76,1.76,0,0,0,12.25,4h-3A.25.25,0,0,1,9,3.85a.25.25,0,0,1,.05-.27L10.3,2.26a.75.75,0,0,0-1.1-1l-2,2.2a.24.24,0,0,1-.36,0l-2-2.2a.75.75,0,1,0-1.1,1L4.91,3.58a.25.25,0,0,1,0,.27A.25.25,0,0,1,4.73,4h-3A1.76,1.76,0,0,0,0,5.75v6.5A1.76,1.76,0,0,0,1.75,14h10.5A1.76,1.76,0,0,0,14,12.25ZM11.5,11.5a.5.5,0,0,1-.5.5H3a.5.5,0,0,1-.5-.5v-5A.5.5,0,0,1,3,6h8a.5.5,0,0,1,.5.5Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'ComputerScreenTv',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
