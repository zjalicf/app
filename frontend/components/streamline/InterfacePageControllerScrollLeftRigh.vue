<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M9.5,11.75a1,1,0,0,1-.72-1.7l2.8-2.88a.26.26,0,0,0,0-.35L8.78,4a1,1,0,0,1,1.44-1.4L13.61,6A1.34,1.34,0,0,1,14,7a1.37,1.37,0,0,1-.4,1l-3.38,3.48A1,1,0,0,1,9.5,11.75Z"
        />
        <path
            d="M4.5,11.75a1,1,0,0,1-.72-.3L.39,8A1.32,1.32,0,0,1,0,7,1.35,1.35,0,0,1,.4,6L3.78,2.55A1,1,0,1,1,5.22,4L2.42,6.82a.26.26,0,0,0,0,.35l2.8,2.88a1,1,0,0,1-.72,1.7Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfacePageControllerScrollLeftRigh',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
