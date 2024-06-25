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
                d="M12,0H2a.76.76,0,0,0-.75.75v12.5A.76.76,0,0,0,2,14H12a.76.76,0,0,0,.75-.75V.75A.76.76,0,0,0,12,0Zm-.75,12a.5.5,0,0,1-.5.5H4.25a.5.5,0,0,1-.5-.5V2a.5.5,0,0,1,.5-.5h6.5a.5.5,0,0,1,.5.5Z"
            />
            <rect x="5.25" y="3" width="4.5" height="2.5" rx="0.75" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'PhoneContactPhoneBook',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
