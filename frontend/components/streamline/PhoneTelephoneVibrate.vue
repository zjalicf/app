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
                d="M13.25,9.75a.74.74,0,0,1-.53-.22L11.22,8a.75.75,0,0,1,0-1.06L12,6.18a.25.25,0,0,0,0-.36L11.22,5a.75.75,0,0,1,0-1.06l1.5-1.5a.75.75,0,0,1,1.06,1.06L13,4.32a.25.25,0,0,0,0,.36l.79.79a.75.75,0,0,1,0,1.06L13,7.32a.25.25,0,0,0,0,.36l.79.79a.75.75,0,0,1,0,1.06A.74.74,0,0,1,13.25,9.75Z"
            />
            <g>
                <path
                    d="M.75,9.75a.74.74,0,0,1-.53-.22.75.75,0,0,1,0-1.06L1,7.68a.25.25,0,0,0,0-.36L.22,6.53a.75.75,0,0,1,0-1.06L1,4.68a.25.25,0,0,0,0-.36L.22,3.53A.75.75,0,0,1,1.28,2.47L2.78,4A.75.75,0,0,1,2.78,5L2,5.82a.25.25,0,0,0,0,.36L2.78,7A.75.75,0,0,1,2.78,8l-1.5,1.5A.74.74,0,0,1,.75,9.75Z"
                />
                <g>
                    <path
                        d="M3.08,2.15a.24.24,0,0,0,.27.05A.25.25,0,0,0,3.5,2V1.75a.25.25,0,0,1,.25-.25h6.5a.25.25,0,0,1,.25.25V2a.25.25,0,0,0,.15.23.24.24,0,0,0,.27-.05l.86-.83A.25.25,0,0,0,11.84,1a1.75,1.75,0,0,0-1.59-1H3.75A1.75,1.75,0,0,0,2.16,1a.25.25,0,0,0,.06.28Z"
                    />
                    <path
                        d="M10.92,9.85a.24.24,0,0,0-.27,0,.25.25,0,0,0-.15.23v1.22a.25.25,0,0,1-.25.25H3.75a.25.25,0,0,1-.25-.25V10a.25.25,0,0,0-.15-.23.24.24,0,0,0-.27,0c-.35.33-.81.78-1,1A.27.27,0,0,0,2,11v1.26A1.76,1.76,0,0,0,3.75,14h6.5A1.76,1.76,0,0,0,12,12.25V11a.27.27,0,0,0-.08-.19C11.73,10.63,11.27,10.18,10.92,9.85Z"
                    />
                </g>
            </g>
        </g>
    </svg>
</template>
<script>
export default {
    name: 'PhoneTelephoneVibrate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
