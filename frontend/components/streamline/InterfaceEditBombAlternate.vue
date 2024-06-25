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
                d="M13.78.22a.75.75,0,0,0-1.06,0l-1.6,1.6a.26.26,0,0,1-.33,0,6.77,6.77,0,1,0,1.36,1.36.26.26,0,0,1,0-.33l1.6-1.6A.75.75,0,0,0,13.78.22Zm-7,12.28A5.25,5.25,0,1,1,12,7.25,5.26,5.26,0,0,1,6.75,12.5Z"
            />
            <path
                d="M6.75,3.75a3.5,3.5,0,0,0-3.5,3.5.75.75,0,0,0,1.5,0,2,2,0,0,1,2-2,.75.75,0,0,0,0-1.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceEditBombAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
