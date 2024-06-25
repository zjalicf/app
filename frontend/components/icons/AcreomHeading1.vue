<template>
    <svg
        :width="size"
        :height="size"
        viewBox="0 0 14 14"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M1 11V4H2.54805V6.88818H5.69063V4H7.2351V11H5.69063V8.1084H2.54805V11H1Z"
        />
        <path
            d="M13 4V11H11.4519V5.40479H11.409L9.73229 6.40967V5.09717L11.5449 4H13Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'AcreomHeading1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
