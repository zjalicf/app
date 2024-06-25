<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <circle cx="7" cy="2" r="2" />
            <path
                d="M10.5,8.5a3.5,3.5,0,0,0-7,0v1A.5.5,0,0,0,4,10h.56a.5.5,0,0,1,.49.44l.4,3.12a.5.5,0,0,0,.49.44H8.06a.5.5,0,0,0,.49-.44L9,10.44A.5.5,0,0,1,9.44,10H10a.5.5,0,0,0,.5-.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceUserFullBody',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
