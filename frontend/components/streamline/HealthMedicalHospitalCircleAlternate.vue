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
                d="M7,14a7,7,0,1,1,7-7A7,7,0,0,1,7,14ZM7,1.5A5.5,5.5,0,1,0,12.5,7,5.51,5.51,0,0,0,7,1.5Z"
            />
            <path
                d="M9,3.5a1,1,0,0,0-1,1V5.75A.25.25,0,0,1,7.75,6H6.25A.25.25,0,0,1,6,5.75V4.5a1,1,0,0,0-2,0v5a1,1,0,0,0,2,0V8.25A.25.25,0,0,1,6.25,8h1.5A.25.25,0,0,1,8,8.25V9.5a1,1,0,0,0,2,0v-5A1,1,0,0,0,9,3.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'HealthMedicalHospitalCircleAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
