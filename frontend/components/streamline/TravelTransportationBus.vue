<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13.5,2a2,2,0,0,0-2-2h-9a2,2,0,0,0-2,2v8.5a2,2,0,0,0,2,2V13a1,1,0,0,0,2,0v-.5h5V13a1,1,0,0,0,2,0v-.5a2,2,0,0,0,2-2ZM4,10A1,1,0,1,1,5,9,1,1,0,0,1,4,10Zm6,0a1,1,0,1,1,1-1A1,1,0,0,1,10,10ZM2.75,6a.25.25,0,0,1-.25-.25V2.25A.25.25,0,0,1,2.75,2h8.5a.25.25,0,0,1,.25.25v3.5a.25.25,0,0,1-.25.25Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'TravelTransportationBus',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
