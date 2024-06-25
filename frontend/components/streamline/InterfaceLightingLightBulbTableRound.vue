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
                d="M12.92,8a1,1,0,0,0,1-1.17,7,7,0,0,0-13.8,0,1,1,0,0,0,.22.82A1,1,0,0,0,1.08,8Z"
            />
            <path
                d="M9.75,12.5H8a.25.25,0,0,1-.25-.25v-3A.25.25,0,0,0,7.5,9h-1a.25.25,0,0,0-.25.25v3A.25.25,0,0,1,6,12.5H4.25a.75.75,0,0,0,0,1.5h5.5a.75.75,0,0,0,0-1.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceLightingLightBulbTableRound',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
