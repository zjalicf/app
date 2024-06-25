<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13.2,6.2H12C11.7,4.1,9.9,2.3,7.8,2V0.8C7.8,0.3,7.4,0,7,0S6.2,0.3,6.2,0.8V2C4.1,2.3,2.3,4.1,2,6.2H0.8
	C0.3,6.2,0,6.6,0,7s0.3,0.8,0.8,0.8H2c0.3,2.2,2.1,3.9,4.3,4.3v1.2C6.2,13.7,6.6,14,7,14s0.8-0.3,0.8-0.8V12
	c2.2-0.3,3.9-2.1,4.3-4.3h1.2C13.7,7.8,14,7.4,14,7S13.7,6.2,13.2,6.2z M7,10.6C5,10.6,3.4,9,3.4,7S5,3.4,7,3.4S10.6,5,10.6,7
	S9,10.6,7,10.6z"
        />
    </svg>
</template>
<script>
export default {
    name: 'TravelMapLocationTarget2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
