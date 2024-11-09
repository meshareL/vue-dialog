import {
    defineComponent,
    h as createElement,
    Transition,
    withDirectives,
    vShow,
    ref,
    mergeProps,
    watch,
    provide,
    onBeforeUnmount,
    onUnmounted,
    nextTick,
    computed,
    onMounted
} from 'vue';
import type {
    PublicProps,
    HTMLAttributes,
    VNode,
    PropType,
    TransitionProps,
    ComponentPublicInstance,
    SlotsType
} from 'vue';
import { dialogActionKey, fetchIdKey, setFocusElementRefKey, dialogDraggableKey } from './internal/key';
import { enableBodyScroll, disableBodyScroll } from 'body-scroll-lock-upgrade';
import { Draggable } from '@neodrag/vanilla';
import { generateId, isFocusable, focusFirstDescendant } from './internal/util';
import classnames from '../css/index.module.scss';

type Prop = {
    modelValue: boolean;
    /** @default dialog */
    role?: 'dialog' | 'alertdialog';
    /**
     * 是否显示为模态对话框
     *
     * 模态对话框默认不能通过点击 backdrop 区域关闭对话框,
     * 如果需要该行为, 则需要明确传递 `backdropDismissible` 参数
     *
     * `alertdialog` 默认是模态对话框, 并且不能通过点击 backdrop 区域关闭对话框
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-modal aria-modal
     */
    modal?: boolean | { backdropDismissible: boolean };
    /**
     * 键盘 Escape 按键是否可以关闭对话框
     *
     * @default true
     */
    keyboardDismissible?: boolean;
    /**
     * 对话框是否可拖动
     *
     * 对话框被拖动后再次打开默认不会重置定位, 如果需要该行为, 则需要明确传递 `relocation` 参数
     *
     * @default false
     */
    draggable?: boolean | { relocation: boolean };
    /**
     * 对话框关闭后是否保留此次最后聚焦的元素的焦点, 当再次打开对话框时聚焦到此元素
     *
     * @default false
     */
    retainFocus?: boolean;
    /**
     * 对话框开启时, 是否锁定屏幕滚动
     *
     * @default true
     */
    scrollLock?: boolean;
};

const transitionProps: TransitionProps = {
    css: false,
    mode: 'out-in',
    onEnter: (element, done) => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return done();
        }

        element.animate(
            { opacity: [ 0, 1 ] },
            { duration: 300, easing: 'ease-in-out' }
        )
            .finished
            .finally(() => done());
    }
};

const component = defineComponent((props, { emit, slots, attrs, expose }) => {
    const shareId = generateId(),
          title = { id: `${shareId}_title`, isUsed: ref(false) },
          subtitle = { id: `${shareId}_subtitle`, isUsed: ref(false) };

    function toggle(value: boolean = !props.modelValue): void {
        if (value === props.modelValue) return;
        emit('update:modelValue', value);
    }

    watch(() => props.modelValue, value => {
        if (!props.scrollLock) return;

        value
            ? disableBodyScroll(document.body, { reserveScrollBarGap: true })
            : enableBodyScroll(document.body);
    }, { immediate: true });

    onBeforeUnmount(() => props.modelValue && enableBodyScroll(document.body));

    const dialogRef = ref<HTMLDivElement | null>(null);
    let dragInstance: Draggable | null = null;

    watch(() => props.modelValue, async value => {
        if (typeof props.draggable === 'boolean' && !props.draggable) return;

        await nextTick();
        const dialog = dialogRef.value;
        if (!(dialog instanceof HTMLDivElement)) return;

        if (dragInstance === null) {
            dragInstance = new Draggable(dialog, {
                bounds: 'body',
                handle: '[data-drag-allowed]',
                cancel: '[data-drag-disallowed]'
            });
        }

        if (value) return;

        if (typeof props.draggable === 'object' && props.draggable.relocation) {
            dragInstance.destroy();
            dragInstance = null;
        }
    }, { immediate: true });

    onUnmounted(() => dragInstance && dragInstance.destroy());

    let beforeOpenFocusElement: HTMLElement | null = null;
    let lastFocusElement: HTMLElement | null = null;
    const defaultFocusElement = {
        ref: ref<HTMLElement | ComponentPublicInstance | null>(null),
        isBuiltIn: true,
        focus: function (): boolean {
            const elementRef = this.ref.value;
            if (elementRef === null) return false;

            if (elementRef instanceof HTMLElement) {
                elementRef.focus({ preventScroll: false });
                return true;
            }

            if ('$el' in elementRef) {
                (elementRef.$el as HTMLElement).focus({ preventScroll: false });
                return true;
            }

            return false;
        }
    };

    function setFocusElementRef(element: Element | ComponentPublicInstance | null, isBuiltIn: boolean): void {
        if (element === null
            || (element instanceof Element && !(element instanceof HTMLElement))) {
            return;
        }

        if (defaultFocusElement.ref.value === null || defaultFocusElement.isBuiltIn) {
            defaultFocusElement.ref.value = element;
            defaultFocusElement.isBuiltIn = isBuiltIn;
        }
    }

    watch(() => props.modelValue, async value => {
        if (!value) {
            if (!(beforeOpenFocusElement instanceof HTMLElement)) return;
            beforeOpenFocusElement.focus({ preventScroll: false });
            beforeOpenFocusElement = null;
            return;
        }

        const activated = document.activeElement;
        if (activated instanceof HTMLElement) {
            beforeOpenFocusElement = activated;
        }

        if (props.retainFocus && lastFocusElement instanceof HTMLElement) {
            await nextTick();
            lastFocusElement.focus({ preventScroll: false });
            return;
        }

        await nextTick();
        const dialog = dialogRef.value;
        if (!(dialog instanceof HTMLDivElement)) return;

        focusFirstDescendant(dialog) || defaultFocusElement.focus();
    }, { immediate: true });

    onMounted(() => beforeOpenFocusElement?.focus({ preventScroll: false }));

    function onEscapeDismiss(event: KeyboardEvent): void {
        if (!props.keyboardDismissible || event.key !== 'Escape') return;
        !event.defaultPrevented && event.preventDefault();
        toggle(false);
    }

    /**
     * 限制 Tab 按键转移焦点时的范围
     *
     * @param event KeyboardEvent
     */
    function onKeyboardNavigateTab(event: KeyboardEvent): void {
        if (event.key !== 'Tab') return;

        const dialog = dialogRef.value;
        if (!(dialog instanceof HTMLDivElement)) return;

        const elements = Array
            .from(dialog.querySelectorAll('*'))
            .filter((el): el is HTMLElement => isFocusable(el));
        if (!elements.length) return;

        const movement = event.shiftKey ? -1 : 1,
              focused = dialog.contains(document.activeElement) ? document.activeElement : null;

        let index = movement === -1 ? -1 : 0;
        if (focused instanceof HTMLElement && elements.includes(focused)) {
            index = elements.indexOf(focused) + movement;
        }

        if (index < 0) {
            index = elements.length - 1;
        } else {
            index = index % elements.length;
        }

        const found = elements[index];
        if (!found) return;

        lastFocusElement = found;
        !event.defaultPrevented && event.preventDefault();
        found.focus({ preventScroll: false });
    }

    const isModal = computed(() => {
        if (props.modal === null) {
            return props.role === 'alertdialog';
        }

        return typeof props.modal === 'object' ? true : props.modal;
    });

    const isBackdropDismiss = computed(() => {
        if (props.modal !== null && typeof props.modal === 'object') {
            return props.modal.backdropDismissible;
        }

        return false;
    });

    function renderBackdrop(): VNode {
        const data: Record<string, unknown> = {
            class: classnames.backdrop,
            role: 'none',
            onClick: () => {
                if (!isModal.value || !isBackdropDismiss.value) return;
                toggle(false);
            }
        };

        return withDirectives(createElement('div', data), [ [ vShow, props.modelValue ] ]);
    }

    expose({ show: () => toggle(true), close: () => toggle(false) });
    provide(dialogActionKey, { show: () => toggle(true), close: () => toggle(false) });
    provide(dialogDraggableKey, computed(() => typeof props.draggable === 'object' || props.draggable));
    provide(setFocusElementRefKey, setFocusElementRef);
    provide(fetchIdKey, {
        title: () => {
            title.isUsed.value = true;
            return title.id;
        },
        subtitle: () => {
            subtitle.isUsed.value = true;
            return subtitle.id;
        }
    });

    return () => {
        const data: Record<string, unknown> = {
            ref: dialogRef,
            class: classnames.dialog,
            role: props.role,
            tabindex: -1,
            'aria-modal': isModal.value,
            'aria-labelledby': title.isUsed.value ? title.id : null,
            'aria-describedby': subtitle.isUsed.value ? subtitle.id : null,
            onKeydown: [ onKeyboardNavigateTab, onEscapeDismiss ]
        };

        const dialog = createElement(
            Transition,
            transitionProps,
            () => withDirectives(
                createElement(
                    'div',
                    mergeProps(data, attrs),
                    slots.default?.({ ref: (el: Element | ComponentPublicInstance | null) => setFocusElementRef(el, false) })
                ),
                [ [ vShow, props.modelValue ] ]
            ));

        return isModal.value ? [ dialog, renderBackdrop() ] : dialog;
    };
}, {
    name: 'VueDialog',
    inheritAttrs: false,
    props: {
        modelValue: {
            type: Boolean,
            required: true
        },
        role: {
            type: String as PropType<'dialog' | 'alertdialog'>,
            required: false,
            default: 'dialog',
            validator: (value: string) => [ 'dialog', 'alertdialog' ].includes(value)
        },
        modal: {
            type: [ Boolean, Object ] as PropType<boolean | { backdropDismissible: boolean } | null>,
            required: false,
            default: null
        },
        keyboardDismissible: {
            type: Boolean,
            required: false,
            default: true
        },
        draggable: {
            type: [ Boolean, Object ] as PropType<boolean | { relocation: boolean }>,
            required: false,
            default: false
        },
        retainFocus: {
            type: Boolean,
            required: false,
            default: false
        },
        scrollLock: {
            type: Boolean,
            required: false,
            default: true
        }
    },
    emits: { 'update:modelValue': null as unknown as (value: boolean) => void },
    slots: Object as SlotsType<{ default?: Record<string, unknown> }>
});

/**
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal
 *
 * @example
 * ```html
 * <Dialog v-model="status"
 *         :modal="{ backdropDismissible: true }"
 *         keyboard-dismissible
 *         :draggable="{ relocation: true }"
 *         scroll-lock>
 *  <Header>Title</Header>
 *  <Body>...</Body>
 *  <Footer>...</Footer>
 * </Dialog>
 * ```
 */
export default component as unknown as new() => {
    $props:
        PublicProps
        & Omit<HTMLAttributes, 'role' | 'aria-modal'>
        & Prop
        & { 'onUpdate:modelValue'?: (value: boolean) => void };

    $slots: { default?: (props: { ref: (el: Element | ComponentPublicInstance | null) => void }) => VNode[] };

    show: () => void;
    close: () => void;
};
export type { Prop };
