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
                d="M9.5,13.5H3a3,3,0,0,1-3-3v-7a3,3,0,0,1,3-3H9.5a3,3,0,0,1,3,3,1,1,0,0,1-2,0,1,1,0,0,0-1-1H3a1,1,0,0,0-1,1v7a1,1,0,0,0,1,1H9.5a1,1,0,0,0,1-1,1,1,0,0,1,2,0A3,3,0,0,1,9.5,13.5Z"
            />
            <path
                d="M14,7a.76.76,0,0,0-.75-.75H7.66a.25.25,0,0,1-.23-.15.26.26,0,0,1,.06-.28l.29-.29A.75.75,0,0,0,6.72,4.47l-2,2a.75.75,0,0,0,0,1.06l2,2A.75.75,0,0,0,7.78,8.47l-.29-.29a.26.26,0,0,1-.06-.28.25.25,0,0,1,.23-.15h5.59A.76.76,0,0,0,14,7Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceLoginSquareAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
