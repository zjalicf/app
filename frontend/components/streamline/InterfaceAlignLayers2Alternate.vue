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
                d="M12.38,7.5H6.62A1.63,1.63,0,0,1,5,5.88V2.38A1.63,1.63,0,0,1,6.62.75h5.76A1.63,1.63,0,0,1,14,2.38v3.5A1.63,1.63,0,0,1,12.38,7.5ZM6.62,2a.38.38,0,0,0-.37.38v3.5a.38.38,0,0,0,.37.37h5.76a.38.38,0,0,0,.37-.37V2.38A.38.38,0,0,0,12.38,2Z"
            />
            <path
                d="M9.88,10.12H4.12A1.62,1.62,0,0,1,2.5,8.5V4.75a.63.63,0,1,1,1.25,0V8.5a.38.38,0,0,0,.37.38H9.88a.62.62,0,1,1,0,1.24Z"
            />
            <path
                d="M7.62,12.62h-6A1.62,1.62,0,0,1,0,11V7a.62.62,0,0,1,.62-.62A.62.62,0,0,1,1.25,7v4a.38.38,0,0,0,.37.38h6a.62.62,0,1,1,0,1.24Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceAlignLayers2Alternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
