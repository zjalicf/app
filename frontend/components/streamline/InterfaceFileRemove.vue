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
                d="M12.78,4,9,.22A.75.75,0,0,0,8.5,0H2.75A1.76,1.76,0,0,0,1,1.75v10.5A1.76,1.76,0,0,0,2.75,14h8.5A1.76,1.76,0,0,0,13,12.25V4.5A.75.75,0,0,0,12.78,4ZM11.5,12.25a.25.25,0,0,1-.25.25H2.75a.25.25,0,0,1-.25-.25V1.75a.25.25,0,0,1,.25-.25H8.09a.26.26,0,0,1,.17.07l3.17,3.17a.26.26,0,0,1,.07.17Z"
            />
            <path
                d="M4.62,7.51a.63.63,0,0,0,.63.62h3.5a.63.63,0,1,0,0-1.25H5.25A.63.63,0,0,0,4.62,7.51Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceFileRemove',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
