<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <circle cx="4.5" cy="2" r="2" />
            <path
                d="M6,8.67a4.06,4.06,0,0,1,.84-2.46.25.25,0,0,0,0-.34A3.5,3.5,0,0,0,1,8.5v1a.5.5,0,0,0,.5.5h.56a.5.5,0,0,1,.49.44L3,13.56a.5.5,0,0,0,.49.44H5.56a.5.5,0,0,0,.49-.44l.38-3a.25.25,0,0,0,0-.12A5.61,5.61,0,0,1,6,8.67Z"
            />
            <path
                d="M10.25,6A2.71,2.71,0,0,0,7.5,8.67c0,1.11,1.57,4,2.33,5.11a.51.51,0,0,0,.84,0c.76-1.15,2.33-4,2.33-5.11A2.71,2.71,0,0,0,10.25,6Zm0,3.75a1,1,0,1,1,1-1A1,1,0,0,1,10.25,9.75Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'TravelMapLocationUserPin',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
