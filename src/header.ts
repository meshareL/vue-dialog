import {
    defineComponent,
    h as createElement,
    inject,
    ref
} from 'vue';
import type {
    VNodeProps,
    AllowedComponentProps,
    ComponentCustomProps,
    HTMLAttributes,
    VNodeChild,
    VNode
} from 'vue';
import { dialogActionKey, fetchIdKey, pushInternalCloserKey } from './key';

type Prop = {
    /** 是否显示关闭对话框按钮 */
    dismissible?: boolean
};

function renderIcon(): VNode {
    const data: Record<string, unknown> = {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 16 16',
        width: 16,
        height: 16,
        fill: 'currentColor',
        role: 'img',
        'aria-hidden': 'true'
    }
        , path: Record<string, unknown> = {
        'fill-rule': 'evenodd',
        d: 'M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 ' +
            '1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 ' +
            '1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 ' +
            '1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z'
    };
    return createElement('svg', data, createElement('path', path));
}

const component = defineComponent({
    name: 'VueDialogHeader',
    inheritAttrs: true,
    props: {
        dismissible: {
            type: Boolean,
            required: false,
            default: true
        }
    },
    setup(props, { slots }) {
        const closerRef = ref<HTMLButtonElement | null>(null)
            , fetchId = inject(fetchIdKey, null)
            , dialogAction = inject(dialogActionKey, null);

        inject(pushInternalCloserKey, null)?.(() => {
            const button = closerRef.value;
            if (!(button instanceof HTMLButtonElement)) {
                return false;
            }

            button.focus({ preventScroll: false });
            return true;
        });

        function dismissDialog(event: MouseEvent): void {
            !event.defaultPrevented && event.preventDefault();
            dialogAction?.close();
        }

        return () => {
            const children: VNodeChild = []
                , title = createElement('h4', { class: 'title', id: fetchId?.titleId() }, slots['default']?.());

            if (slots['subtitle']) {
                const titleBar = [
                    title,
                    createElement('p', { class: 'subtitle', id: fetchId?.subtitleId() }, slots['subtitle']())
                ];
                children.push(createElement('div', { class: 'title-bar' }, titleBar));

            } else {
                children.push(title);
            }

            if (props.dismissible) {
                const data: Record<string, unknown> = {
                    ref: closerRef,
                    class: 'closer',
                    type: 'button',
                    'aria-label': 'Close',
                    onClick: dismissDialog
                };
                children.push(createElement('button', data, renderIcon()));
            }

            return createElement('header', { class: 'dialog-header' }, children);
        };
    }
});

export default component as new() => {
    $props:
        VNodeProps
        & AllowedComponentProps
        & ComponentCustomProps
        & HTMLAttributes
        & Prop;

    $slots: {
        default?: () => VNode[];
        subtitle?: () => VNode[]
    }
};
export type { Prop };
