<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M12.71,4.29l-4-4A1,1,0,0,0,8,0H3A2,2,0,0,0,1,2V12a2,2,0,0,0,2,2h8a2,2,0,0,0,2-2V5A1,1,0,0,0,12.71,4.29ZM3.25,12A.25.25,0,0,1,3,11.75V2.25A.25.25,0,0,1,3.25,2h3.5A.25.25,0,0,1,7,2.25V5A1,1,0,0,0,8,6h2.75a.25.25,0,0,1,.25.25v5.5a.25.25,0,0,1-.25.25Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceContentFile',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
