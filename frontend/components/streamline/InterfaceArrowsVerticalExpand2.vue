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
                d="M9.28,9.53a.75.75,0,0,0-.53-1.28H8A.25.25,0,0,1,7.75,8V6A.25.25,0,0,1,8,5.75h.75a.75.75,0,0,0,.53-1.28L7.53,2.72a.75.75,0,0,0-1.06,0L4.72,4.47a.74.74,0,0,0-.16.82.74.74,0,0,0,.69.46H6A.25.25,0,0,1,6.25,6V8A.25.25,0,0,1,6,8.25H5.25a.74.74,0,0,0-.69.46.74.74,0,0,0,.16.82l1.75,1.75a.75.75,0,0,0,1.06,0Z"
            />
            <path
                d="M14,.75A.76.76,0,0,0,13.25,0H.75A.76.76,0,0,0,0,.75a.76.76,0,0,0,.75.75h12.5A.76.76,0,0,0,14,.75Z"
            />
            <path
                d="M14,13.25a.76.76,0,0,0-.75-.75H.75a.75.75,0,0,0,0,1.5h12.5A.76.76,0,0,0,14,13.25Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsVerticalExpand2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
