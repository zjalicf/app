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
                d="M7,3a7,7,0,0,0-7,7,.5.5,0,0,0,.5.5H2a.25.25,0,0,0,.25-.25V10a4.75,4.75,0,0,1,9.5,0v.25a.25.25,0,0,0,.25.25h1.5A.5.5,0,0,0,14,10,7,7,0,0,0,7,3Z"
            />
            <path
                d="M7,6.75A3.26,3.26,0,0,0,3.75,10v.25A.25.25,0,0,0,4,10.5H5.5A.5.5,0,0,0,6,10a1,1,0,0,1,2,0,.5.5,0,0,0,.5.5H10a.25.25,0,0,0,.25-.25V10A3.26,3.26,0,0,0,7,6.75Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'NatureEcologyRainbow',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
