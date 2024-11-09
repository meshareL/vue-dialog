import { defineComponent, ref } from 'vue';
import type {
    PublicProps,
    HTMLAttributes,
    VNode,
    SlotsType
} from 'vue';

type Prop = {
    /**
     * 对话框默认是否打开
     *
     * @default false
     */
    defaultOpen?: boolean;
};

const component = defineComponent((props, { slots }) => {
    const status = ref(props.defaultOpen);

    function toggle(value: boolean = !status.value): void {
        status.value = value;
    }

    return () => {
        if (!slots.default) {
            throw 'You must provide a default slot';
        }

        return slots.default({ status: status.value, toggle });
    };
}, {
    name: 'VueDialogContainer',
    inheritAttrs: false,
    props: {
        defaultOpen: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    slots: Object as SlotsType<{ default?: Record<string, unknown> }>
});

/**
 * 如果对话框只是用来展示一简单的些信息, 则可以配合该组件使用
 *
 * @example
 * ```html
 * <Container #default="{ status, changeStatus }">
 *   <Dialog :model-value="status" @update:model-value="changeStatus">
 *     ...
 *     <Footer>
 *       <button @click="() => changeStatus(false)">Close</button>
 *     </Footer>
 *   </Dialog>
 *   <button @click="() => changeStatus(true)">Open</button>
 * </Container>
 * ```
 */
export default component as unknown as new() => {
    $props:
        PublicProps
        & HTMLAttributes
        & Prop;

    $slots: { default?: (props: { status: boolean; toggle: (value?: boolean) => void }) => VNode[] };
};
export type { Prop };
