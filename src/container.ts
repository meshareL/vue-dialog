import { defineComponent, ref } from 'vue';
import type {
    VNodeProps,
    AllowedComponentProps,
    ComponentCustomProps,
    HTMLAttributes,
    VNode
} from 'vue';
import type { KebabCasedProperties } from 'type-fest';

type Prop = {
    /** 对话框默认是否打开 */
    defaultOpen?: boolean;
};

const component = defineComponent({
    name: 'VueDialogContainer',
    inheritAttrs: false,
    props: {
        defaultOpen: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    setup(props, { slots }) {
        const status = ref(props.defaultOpen);

        function changeStatus(value?: boolean): void {
            value ??= !status.value;
            status.value = value;
        }

        return () => {
            if (!slots['default']) {
                throw 'You must provide a default slot';
            }

            return slots['default']({ status: status.value, changeStatus });
        }
    }
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
export default component as new() => {
    $props:
        VNodeProps
        & AllowedComponentProps
        & ComponentCustomProps
        & HTMLAttributes
        & KebabCasedProperties<Prop>;

    $slots: {
        default?: () => VNode[]
    }
};
export type { Prop };
