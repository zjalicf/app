<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <circle cx="5" cy="5" r="2" />
            <path
                d="M14,1.25A1.25,1.25,0,0,0,12.75,0H1.25A1.25,1.25,0,0,0,0,1.25v11.5A1.25,1.25,0,0,0,1.25,14h11.5A1.25,1.25,0,0,0,14,12.75Zm-1.75.25a.25.25,0,0,1,.25.25V8.29a.25.25,0,0,1-.15.23.25.25,0,0,1-.27,0L10.26,6.79a1.13,1.13,0,0,0-1.55.06L5.36,10.42a.27.27,0,0,1-.19.08H1.75a.25.25,0,0,1-.25-.25V1.75a.25.25,0,0,1,.25-.25Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ImagePictureLandscape2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
