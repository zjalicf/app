<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceValidationCheck from '~/components/streamline/InterfaceValidationCheck.vue';
import InterfaceValidationCheckCircle from '~/components/streamline/InterfaceValidationCheckCircle.vue';
import InterfaceDelete1 from '~/components/streamline/InterfaceDelete1.vue';
import { TaskActions } from '~/constants';
import InterfaceDeleteCircle from '~/components/streamline/InterfaceDeleteCircle.vue';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import InterfaceTimeClockCircleAlternate from '~/components/streamline/InterfaceTimeClockCircleAlternate.vue';
import InterfaceDeleteBin1 from '~/components/streamline/InterfaceDeleteBin1.vue';

@Component({
    name: 'NotificationMixin',
    computed: {
        TaskActions() {
            return TaskActions;
        },
    },
    components: {
        InterfaceDeleteBin1,
        InterfaceTimeClockCircleAlternate,
        DocumentIcon,
        InterfaceDeleteCircle,
        InterfaceDelete1,
        InterfaceValidationCheckCircle,
        InterfaceValidationCheck,
    },
})
export default class NotificationMixin extends Vue {
    @Prop({ default: null })
    action!: string;

    @Prop({
        default: () => {},
    })
    callback!: Function;

    timeout: any = null;

    get text(): string {
        throw new Error('Not implemented');
    }

    callCallback() {
        throw new Error('Not implemented');
    }

    closeNotification() {
        throw new Error('Not implemented');
    }

    resetTimeout() {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.closeNotification();
        }, 5000);
    }

    mounted() {
        this.timeout = setTimeout(() => {
            this.closeNotification();
        }, 5000);
    }
}
</script>
