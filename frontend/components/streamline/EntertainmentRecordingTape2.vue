<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M11,4A3,3,0,0,0,8,7a2.91,2.91,0,0,0,.23,1.15.26.26,0,0,1,0,.24A.26.26,0,0,1,8,8.5H6a.26.26,0,0,1-.21-.11.26.26,0,0,1,0-.24A2.91,2.91,0,0,0,6,7a3,3,0,1,0-3,3h8a3,3,0,0,0,0-6ZM1.5,7A1.5,1.5,0,1,1,3,8.5,1.5,1.5,0,0,1,1.5,7ZM11,8.5A1.5,1.5,0,1,1,12.5,7,1.5,1.5,0,0,1,11,8.5Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'EntertainmentRecordingTape2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
