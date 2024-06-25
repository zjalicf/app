<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <circle cx="7" cy="3.5" r="3.5" />
            <path
                d="M13.28,13.33a6.66,6.66,0,0,0-12.56,0,.53.53,0,0,0,.06.46.52.52,0,0,0,.41.21H12.81a.52.52,0,0,0,.41-.21A.53.53,0,0,0,13.28,13.33Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceUserSingle',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
