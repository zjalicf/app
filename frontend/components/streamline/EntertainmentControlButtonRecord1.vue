<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <circle cx="7" cy="7" r="2" />
            <path
                d="M7,0a7,7,0,1,0,7,7A7,7,0,0,0,7,0ZM7,10.5A3.5,3.5,0,1,1,10.5,7,3.5,3.5,0,0,1,7,10.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'EntertainmentControlButtonRecord1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
