<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M12.25,0H1.75A1.76,1.76,0,0,0,0,1.75v10.5A1.76,1.76,0,0,0,1.75,14h10.5A1.76,1.76,0,0,0,14,12.25V1.75A1.76,1.76,0,0,0,12.25,0ZM12,11.25a.76.76,0,0,1-.75.75H2.75A.76.76,0,0,1,2,11.25v-.5A.76.76,0,0,1,2.75,10h8.5a.76.76,0,0,1,.75.75Zm-.07-3.19a.75.75,0,0,1-.68.44H2.75a.75.75,0,0,1-.68-.44.76.76,0,0,1,.11-.8l4.25-5a.78.78,0,0,1,1.14,0l4.25,5A.76.76,0,0,1,11.93,8.06Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'ComputerKeyboardEject1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
