<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M12,3.5H6.8L5.5,1.2C5.4,1.1,5.2,1,5.1,1H2C0.9,1,0,1.9,0,3v8c0,1.1,0.9,2,2,2h10c1.1,0,2-0.9,2-2V5.5
	C14,4.4,13.1,3.5,12,3.5z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceContentFolder',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
