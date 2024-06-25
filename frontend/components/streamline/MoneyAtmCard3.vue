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
                d="M12.5,6H1.5A1.5,1.5,0,0,0,0,7.5v5A1.5,1.5,0,0,0,1.5,14h11A1.5,1.5,0,0,0,14,12.5v-5A1.5,1.5,0,0,0,12.5,6ZM7,12a2,2,0,1,1,2-2A2,2,0,0,1,7,12Z"
            />
            <g>
                <path
                    d="M7,0a.76.76,0,0,0-.75.75v3a.75.75,0,0,0,1.5,0v-3A.76.76,0,0,0,7,0Z"
                />
                <path
                    d="M3.5,1.5a.76.76,0,0,0-.75.75v1.5a.75.75,0,0,0,1.5,0V2.25A.76.76,0,0,0,3.5,1.5Z"
                />
                <path
                    d="M10.5,1.5a.76.76,0,0,0-.75.75v1.5a.75.75,0,0,0,1.5,0V2.25A.76.76,0,0,0,10.5,1.5Z"
                />
            </g>
        </g>
    </svg>
</template>
<script>
export default {
    name: 'MoneyAtmCard3',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
