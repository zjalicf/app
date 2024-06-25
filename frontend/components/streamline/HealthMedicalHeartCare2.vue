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
                d="M11.81,5.79a2.81,2.81,0,0,0-3.9,0l-.74.71a.25.25,0,0,1-.34,0l-.74-.71a2.81,2.81,0,0,0-3.9,0,2.68,2.68,0,0,0,0,3.84l4.29,4.16a.75.75,0,0,0,1,0l4.29-4.16a2.68,2.68,0,0,0,0-3.84Z"
            />
            <circle cx="7" cy="2" r="2" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'HealthMedicalHeartCare2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
