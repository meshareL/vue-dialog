import {
    defineComponent,
    h as createElement,
    inject
} from 'vue';
import type {
    PublicProps,
    HTMLAttributes,
    VNodeProps,
    VNodeChild,
    VNode,
    SlotsType
} from 'vue';
import { dialogActionKey, fetchIdKey, setFocusElementRefKey, dialogDraggableKey } from './internal/key';
import classnames from '../css/index.module.scss';

type Prop = {
    /**
     * 是否显示关闭对话框按钮
     *
     * 你应该总是为对话框在底部提供一个按钮用来关闭对话框
     *
     * @default false
     */
    dismissible?: boolean;
};

function renderDismissIcon(): VNode {
    const data: Record<string, unknown> = {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 16 16',
        width: 16,
        height: 16,
        fill: 'currentcolor',
        role: 'img',
        'aria-hidden': 'true'
    }, path: Record<string, unknown> = {
        'fill-rule': 'evenodd',
        d: 'M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 '
            + '1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 '
            + '1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 '
            + '1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z'
    };
    return createElement('svg', data, createElement('path', path));
}

const component = defineComponent((props, { slots }) => {
    const dialogAction = inject(dialogActionKey, null),
          dialogDraggable = inject(dialogDraggableKey, null),
          fetchId = inject(fetchIdKey, null),
          setFocusElementRef = inject(setFocusElementRefKey, null);

    function dismissDialog(event: MouseEvent): void {
        !event.defaultPrevented && event.preventDefault();
        dialogAction?.close();
    }

    function renderCloseButton(): VNode {
        const data: VNodeProps & Record<string, unknown> = {
            ref: element => setFocusElementRef?.(element, true),
            class: classnames.closer,
            type: 'button',
            'aria-label': 'Close',
            'data-drag-disallowed': dialogDraggable?.value ? '' : null,
            onClick: dismissDialog
        };

        return createElement('button', data, renderDismissIcon());
    }

    return () => {
        const children: VNodeChild = [ createElement(
            'h4',
            { class: classnames.title, id: fetchId?.title() },
            slots.default?.()
        ) ];

        if (props.dismissible) {
            children.push(renderCloseButton());
        }

        if (slots.subtitle) {
            children.push(createElement(
                'p',
                { class: classnames.subtitle, id: fetchId?.subtitle() },
                slots.subtitle()
            ));
        }

        return createElement(
            'header',
            { class: classnames.header, 'data-drag-allowed': dialogDraggable?.value ? '' : null },
            children
        );
    };
}, {
    name: 'VueDialogHeader',
    inheritAttrs: true,
    props: {
        dismissible: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    slots: Object as SlotsType<{
        default?: Record<string, unknown>;
        subtitle?: Record<string, unknown>;
    }>
});

export default component as unknown as new() => {
    $props:
        PublicProps
        & HTMLAttributes
        & Prop;

    $slots: {
        default?: () => VNode[];
        subtitle?: () => VNode[];
    };
};
export type { Prop };
