<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13.87,5.83l-2.7-4A1.74,1.74,0,0,0,9.71,1H4.29a1.74,1.74,0,0,0-1.46.78L.13,5.83A.72.72,0,0,0,0,6.25v5A1.76,1.76,0,0,0,1.75,13H4.52a1.76,1.76,0,0,0,1.37-.66L7,11l1.11,1.4A1.78,1.78,0,0,0,9.48,13h2.77A1.76,1.76,0,0,0,14,11.25v-5A.72.72,0,0,0,13.87,5.83ZM12.5,11.25a.25.25,0,0,1-.25.25H9.48a.22.22,0,0,1-.19-.09L8,9.77a1.26,1.26,0,0,0-2,0L4.71,11.41a.22.22,0,0,1-.19.09H1.75a.25.25,0,0,1-.25-.25v-4A.25.25,0,0,1,1.75,7h10.5a.25.25,0,0,1,.25.25Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'ComputerVirtualReality',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
