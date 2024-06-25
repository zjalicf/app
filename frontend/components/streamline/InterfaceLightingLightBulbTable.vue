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
                d="M11.38,9a1,1,0,0,0,.75-.33,1,1,0,0,0,.25-.78l-.78-7a1,1,0,0,0-1-.89H3.4a1,1,0,0,0-1,.89l-.78,7a1,1,0,0,0,.25.78A1,1,0,0,0,2.62,9Z"
            />
            <path
                d="M9.75,12.5H8a.25.25,0,0,1-.25-.25v-1.5a.25.25,0,0,0-.25-.25h-1a.25.25,0,0,0-.25.25v1.5A.25.25,0,0,1,6,12.5H4.25a.75.75,0,0,0,0,1.5h5.5a.75.75,0,0,0,0-1.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceLightingLightBulbTable',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
