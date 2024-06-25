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
                d="M10.8.1a.51.51,0,0,0-.52,0A.51.51,0,0,0,10,.5V1.67a1,1,0,0,1-2,0V.5A.51.51,0,0,0,7.72.05.51.51,0,0,0,7.2.1a3,3,0,0,0,.42,5.06.25.25,0,0,1,.13.22v.37A.25.25,0,0,0,8,6h2a.25.25,0,0,0,.25-.25V5.38a.25.25,0,0,1,.13-.22A3,3,0,0,0,10.8.1Z"
            />
            <path
                d="M5.2,7.89A1,1,0,0,1,6,7.5h4.84a1,1,0,0,1,.76.35,1,1,0,0,1,.23.8l-.69,4.5a1,1,0,0,1-1,.85H2.25A.25.25,0,0,1,2,13.75v-4a.25.25,0,0,1,.25-.25H3.47a1,1,0,0,0,.79-.39Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceSettingWrenchHand',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
