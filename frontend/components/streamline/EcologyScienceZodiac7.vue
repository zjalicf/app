<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,14a.76.76,0,0,1-.75-.75C6.25,3.93.7,1.54.47,1.45A.75.75,0,0,1,1,.05C1.24.14,5,1.69,6.76,6.89a.25.25,0,0,0,.48,0C9.05,1.69,12.76.14,13,.05a.76.76,0,0,1,1,.42.76.76,0,0,1-.42,1c-.23.09-5.78,2.48-5.78,11.8A.76.76,0,0,1,7,14Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'EcologyScienceZodiac7',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
