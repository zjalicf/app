<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M12.44,8a.23.23,0,0,1-.06-.16V6.19A.23.23,0,0,1,12.44,6l.75-.94a1.07,1.07,0,0,0,.09-1.21l-.44-.76a1.09,1.09,0,0,0-1.09-.53l-1.19.18a.22.22,0,0,1-.16,0L9,1.93a.24.24,0,0,1-.11-.13L8.44.68a1.07,1.07,0,0,0-1-.68H6.56a1.07,1.07,0,0,0-1,.68L5.12,1.8A.24.24,0,0,1,5,1.93L3.6,2.74a.22.22,0,0,1-.16,0L2.25,2.59a1.09,1.09,0,0,0-1.09.53l-.44.76A1.07,1.07,0,0,0,.81,5.09L1.56,6a.23.23,0,0,1,.06.16V7.81A.23.23,0,0,1,1.56,8l-.75.94a1.07,1.07,0,0,0-.09,1.21l.44.76a1.09,1.09,0,0,0,1.09.53l1.19-.18a.22.22,0,0,1,.16,0L5,12.07a.24.24,0,0,1,.11.13l.44,1.12a1.07,1.07,0,0,0,1,.68h.88a1.07,1.07,0,0,0,1-.68l.44-1.12A.24.24,0,0,1,9,12.07l1.41-.81a.22.22,0,0,1,.16,0l1.19.18a1.09,1.09,0,0,0,1.09-.53l.44-.76a1.07,1.07,0,0,0-.09-1.21ZM7,9.25A2.25,2.25,0,1,1,9.25,7,2.25,2.25,0,0,1,7,9.25Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceSettingCog',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
