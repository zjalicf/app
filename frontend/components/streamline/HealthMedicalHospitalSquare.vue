<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,2a2,2,0,0,0-2-2H2A2,2,0,0,0,0,2V12a2,2,0,0,0,2,2H12a2,2,0,0,0,2-2ZM10,9.5a1,1,0,0,1-2,0V8.25A.25.25,0,0,0,7.75,8H6.25A.25.25,0,0,0,6,8.25V9.5a1,1,0,0,1-2,0v-5a1,1,0,0,1,2,0V5.75A.25.25,0,0,0,6.25,6h1.5A.25.25,0,0,0,8,5.75V4.5a1,1,0,0,1,2,0Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'HealthMedicalHospitalSquare',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
