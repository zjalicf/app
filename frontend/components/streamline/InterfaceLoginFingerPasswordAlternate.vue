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
                d="M2.5,13a.5.5,0,0,0,.5.5H9.5A.5.5,0,0,0,10,13V11.5a2,2,0,0,0-2-2H5.25A.25.25,0,0,1,5,9.25V6.75a1.25,1.25,0,0,0-2.5,0Z"
            />
            <path
                d="M14,1.5a1,1,0,0,0-1-1H1a1,1,0,0,0-1,1v5a1,1,0,0,0,.67.94.22.22,0,0,0,.22,0A.24.24,0,0,0,1,7.21V6.75a2.75,2.75,0,0,1,5.5,0v.5a.25.25,0,0,0,.25.25H13a1,1,0,0,0,1-1Zm-1.77.18a.74.74,0,0,1,.09,1.05L9.57,6A.75.75,0,0,1,9,6.25H9A.75.75,0,0,1,8.47,6L7.22,4.78A.75.75,0,0,1,8.28,3.72l.48.48A.23.23,0,0,0,9,4.27a.25.25,0,0,0,.18-.08l2-2.42A.74.74,0,0,1,12.23,1.68Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceLoginFingerPasswordAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
