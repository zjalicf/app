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
                d="M0,10a.5.5,0,0,0,.5.5h13A.5.5,0,0,0,14,10,7,7,0,0,0,8,3.07a.26.26,0,0,1-.22-.25V2.25A.25.25,0,0,1,8,2h.75a.75.75,0,0,0,0-1.5H5.25a.75.75,0,0,0,0,1.5H6a.25.25,0,0,1,.25.25v.57A.26.26,0,0,1,6,3.07,7,7,0,0,0,0,10Z"
            />
            <path
                d="M13.25,12H.75a.75.75,0,0,0,0,1.5h12.5a.75.75,0,0,0,0-1.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'TravelHotelBell',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
