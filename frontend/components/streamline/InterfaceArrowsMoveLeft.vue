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
                d="M8.5,7a.76.76,0,0,0-.75-.75H3.16a.25.25,0,0,1-.23-.15A.26.26,0,0,1,3,5.82L4.53,4.28A.75.75,0,0,0,3.47,3.22L.22,6.47a.75.75,0,0,0,0,1.06l3.25,3.25a.75.75,0,0,0,1.06,0,.75.75,0,0,0,0-1.06L3,8.18a.26.26,0,0,1-.06-.28.25.25,0,0,1,.23-.15H7.75A.76.76,0,0,0,8.5,7Z"
            />
            <rect x="10" width="4" height="14" rx="1" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsMoveLeft',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
