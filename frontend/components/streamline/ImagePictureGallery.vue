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
                d="M.75,10A.76.76,0,0,1,0,9.25V2.75A1.76,1.76,0,0,1,1.75,1h9a.75.75,0,0,1,0,1.5h-9a.25.25,0,0,0-.25.25v6.5A.76.76,0,0,1,.75,10Z"
            />
            <path
                d="M12.75,3.5H4.25A1.25,1.25,0,0,0,3,4.75v7A1.25,1.25,0,0,0,4.25,13h8.5A1.25,1.25,0,0,0,14,11.75v-7A1.25,1.25,0,0,0,12.75,3.5ZM12.25,5a.25.25,0,0,1,.25.25V9.93a.25.25,0,0,1-.15.23.25.25,0,0,1-.27-.05L9.88,8A2.08,2.08,0,0,0,7.12,8l-2.2,2.07a.25.25,0,0,1-.27.05.25.25,0,0,1-.15-.23V5.25A.25.25,0,0,1,4.75,5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ImagePictureGallery',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
