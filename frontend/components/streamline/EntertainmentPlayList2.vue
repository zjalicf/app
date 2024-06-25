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
                d="M.75,2.5A.76.76,0,0,0,0,3.25v7.5a.76.76,0,0,0,.75.75.76.76,0,0,0,.75-.75V3.25A.76.76,0,0,0,.75,2.5Z"
            />
            <path
                d="M13.25,2.5a.76.76,0,0,0-.75.75v7.5a.75.75,0,0,0,1.5,0V3.25A.76.76,0,0,0,13.25,2.5Z"
            />
            <path
                d="M9.25,0H4.75A1.76,1.76,0,0,0,3,1.75v10.5A1.76,1.76,0,0,0,4.75,14h4.5A1.76,1.76,0,0,0,11,12.25V1.75A1.76,1.76,0,0,0,9.25,0ZM8.76,7.43l-2.5,1.5a.54.54,0,0,1-.51,0A.52.52,0,0,1,5.5,8.5v-3a.52.52,0,0,1,.25-.44.54.54,0,0,1,.51,0l2.5,1.5a.51.51,0,0,1,0,.86Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'EntertainmentPlayList2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
