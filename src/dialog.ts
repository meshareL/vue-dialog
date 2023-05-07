import {
    defineComponent,
    h as createElement,
    Transition,
    withDirectives,
    vShow,
    ref,
    mergeProps,
    watch,
    getCurrentInstance,
    provide,
    reactive,
    onMounted,
    onUnmounted,
    nextTick
} from 'vue';
import type {
    VNodeProps,
    AllowedComponentProps,
    ComponentCustomProps,
    HTMLAttributes,
    VNode,
    PropType,
    TransitionProps,
    ComponentPublicInstance
} from 'vue';
import type { KebabCasedProperties } from 'type-fest';
import { dialogActionKey, fetchIdKey, pushInternalCloserKey } from './key';
import { enableBodyScroll, disableBodyScroll } from 'body-scroll-lock-upgrade';
import { Draggable } from '@neodrag/vanilla';
import type { DragOptions } from '@neodrag/vanilla';

type Prop = {
    modelValue: boolean;
    /**
     * 是否显示为模态对话框
     *
     * 模态对话框默认不能通过点击 backdrop 区域关闭对话框.
     * 如果需要该行为, 则需要明确传递 `backdropDismissible` 参数
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-modal aria-modal
     */
    modal?: boolean | { backdropDismissible?: boolean; };
    /**
     * 键盘 Escape 按键是否可以关闭对话框
     *
     * 当使用模态对话框时, 默认可以通过 Escape 键关闭对话框<br>
     * 当使用非模态对话框时, 则默认不可以通过 Escape 键关闭对话框
     */
    keyboardDismissible?: boolean;
    /**
     * 对话框是否可拖动
     *
     * 对话框被拖动后再次打开默认不会重置定位, 如果需要该行为, 则需要明确传递 `relocation` 参数
     */
    draggable?: boolean | { relocation?: boolean; };
    /** 对话框关闭后是否保留此次最后聚焦的元素的焦点, 当再次打开对话框时聚焦到此元素 */
    retainFocus?: boolean;
    /** 对话框开启时, 是否锁定屏幕滚动 */
    scrollLock?: boolean;
};

const dragOption: DragOptions = {
    axis: 'both',
    bounds: document.body,
    defaultClass: 'vue-dialog',
    defaultClassDragging: 'dragging',
    defaultClassDragged: 'dragged',
    handle: '.dialog-header',
    cancel: '.closer'
};

function useEmitHaveBeenListened() {
    const instanceAttrs = getCurrentInstance()?.vnode.props ?? {};

    return (event: string): boolean => {
        event = event.startsWith('on')
            ? event
            : `on${event.replace(event.charAt(0), str => str.toUpperCase())}`;
        return event in instanceAttrs;
    };
}

function generateId(): string {
    return new Date().getTime().toString(16) + Math.random().toString(16).substring(2);
}

/**
 * 检查给定的元素是否可以聚焦
 *
 * @param element 给定元素
 * @return 如果给定的元素可以聚焦返回 `true`, 否则返回 `false`
 */
function focusable(element: Element): boolean {
    if (!(element instanceof HTMLElement)
        || element.tabIndex < 0
        || element.hidden
        || element.getAttribute('aria-hidden') === 'true'
        || element.getAttribute('aria-disabled') === 'true') {
        return false;
    }

    if (element instanceof HTMLInputElement
        || element instanceof HTMLTextAreaElement
        || element instanceof HTMLSelectElement
        || element instanceof HTMLButtonElement) {
        return !element.disabled && element.type !== 'hidden';
    }

    return true;
}

/**
 * 聚焦给定元素中第一个具有 `autofocus` 属性的元素
 *
 * @param element 给定元素
 * @return 如果成功聚焦元素返回 `true`, 否则返回 `false`
 * */
function autofocus(element: Element): boolean {
    const found = Array
        .from(element.querySelectorAll('[autofocus]'))
        .filter((el): el is HTMLElement => focusable(el))
        [0];

    if (!found) return false;

    found.focus({ preventScroll: false });
    return true;
}

const component = defineComponent({
    name: 'VueDialog',
    inheritAttrs: false,
    props: {
        modelValue: {
            type: Boolean,
            required: true
        },
        modal: {
            type: [ Boolean, Object ] as PropType<boolean | { backdropDismissible?: boolean; }>,
            required: false,
            default: false
        },
        keyboardDismissible: {
            type: Boolean,
            required: false,
            default: undefined
        },
        draggable: {
            type: [ Boolean, Object ] as PropType<boolean | { relocation?: boolean; }>,
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
    emits: {
        'update:modelValue': null,
        beforeOpen: null,
        opened: null,
        beforeClose: null as any as (done: () => void) => void,
        closed: null
    },
    setup(props, { emit, slots, attrs, expose }) {
        const dialogRef = ref<HTMLDivElement | null>(null)
            , emitHaveBeenListened = useEmitHaveBeenListened();

        const shareId = generateId()
            , titleId = `${shareId}_title`
            , subtitleId = `${shareId}_subtitle`
            , idUsageStatus = reactive({ titleId: false, subtitleId: false });

        provide(fetchIdKey, {
            titleId: () => {
                idUsageStatus.titleId = true;
                return titleId;
            },
            subtitleId: () => {
                idUsageStatus.subtitleId = true;
                return subtitleId;
            }
        });

        watch(() => props.modelValue, value => {
            if (!props.scrollLock) {
                return;
            }

            value
                ? disableBodyScroll(document.body, { reserveScrollBarGap: true })
                : enableBodyScroll(document.body);
        }, { immediate: true });

        function show(): void {
            emit('update:modelValue', true);
        }

        function close(): void {
            emit('update:modelValue', false);
        }

        let draggableInstance: Draggable | null = null;

        watch(() => props.modelValue, value => {
            if (value
                || typeof props.draggable === 'boolean'
                || !props.draggable.relocation) {
                return;
            }

            const dialog = dialogRef.value;
            if (!(dialog instanceof HTMLDivElement)) return;

            draggableInstance?.destroy();
            draggableInstance = new Draggable(dialog, dragOption);
        });

        onUnmounted(() => draggableInstance && draggableInstance.destroy());

        onMounted(() => {
            if (!props.draggable) return;

            const dialog = dialogRef.value;
            if (!(dialog instanceof HTMLDivElement)) return;

            draggableInstance = new Draggable(dialog, dragOption);
        });

        function onEscapeDismiss(event: KeyboardEvent): void {
            if (event.key !== 'Escape') return;
            close();
        }

        onUnmounted(() => document.removeEventListener('keyup', onEscapeDismiss));

        watch(() => props.modelValue, value => {
            if (!value) {
                document.removeEventListener('keyup', onEscapeDismiss);
                return;
            }

            if (props.keyboardDismissible ?? !!props.modal) {
                document.addEventListener('keyup', onEscapeDismiss)
            }
        }, { immediate: true });

        const focusRecord = {
            beforeOpenFocused: null,
            lastFocused: null,
            focusInternalCloser: null,
            focusUserProvidedElement: null
        } as {
            beforeOpenFocused: null | HTMLElement;
            lastFocused: null | HTMLElement;
            focusInternalCloser: null | (() => boolean);
            focusUserProvidedElement: null | (() => boolean);
        };

        provide(pushInternalCloserKey, (fun) => (focusRecord.focusInternalCloser = fun));

        watch(() => props.modelValue, async value => {
            if (value) {
                const activated = document.activeElement;
                if (activated instanceof HTMLElement) {
                    focusRecord.beforeOpenFocused = activated;
                }

                if (props.retainFocus && focusRecord.lastFocused) {
                    await nextTick();
                    focusRecord.lastFocused.focus({ preventScroll: false });
                    return;
                }

                await nextTick();
                const dialog = dialogRef.value;
                if (!(dialog instanceof HTMLDivElement)) return;

                autofocus(dialog)
                || focusRecord.focusUserProvidedElement?.()
                || focusRecord.focusInternalCloser?.()
                || dialogRef.value?.focus({ preventScroll: false });

                return;
            }

            const beforeFocused = focusRecord.beforeOpenFocused;
            if (!(beforeFocused instanceof HTMLElement)) return;
            beforeFocused.focus({ preventScroll: false });
        }, { immediate: true });

        /**
         * 获取用户提供的聚焦元素
         *
         * 该函数会通过默认插槽提供给用户, 不要主动调用该函数
         *
         * @param element Element
         */
        function getUserProvidedFocusElement(element: Element | ComponentPublicInstance): void {
            // if (!(element instanceof HTMLElement)) {
            //     throw 'Add the ref function to an element of type HTMLElement';
            // }

            focusRecord.focusUserProvidedElement = () => {
                if (element instanceof HTMLElement) {
                    element.focus({ preventScroll: false });
                    return true;
                }

                // 如何准确判断该元素是否为 Vue 组件 ???
                if ('$el' in element) {
                    const el = (element as ComponentPublicInstance).$el;
                    if (el instanceof HTMLElement) {
                        el.focus({ preventScroll: false });
                        return true;
                    }
                }

                return false;
            };
        }

        /**
         * 限制 Tab 按键转移焦点时的范围
         *
         * @param event KeyboardEvent
         * */
        function onTabLimitFocusSelection(event: KeyboardEvent): void {
            if (event.key !== 'Tab') return;

            const dialog = event.currentTarget;
            if (!(dialog instanceof HTMLDivElement)) return;

            !event.defaultPrevented && event.preventDefault();

            const elements = Array
                .from(dialog.querySelectorAll('*'))
                .filter((el): el is HTMLElement => focusable(el));
            if (!elements.length) return;

            const movement = event.shiftKey ? -1 : 1
                , focused = dialog.contains(document.activeElement) ? document.activeElement : null;

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

            focusRecord.lastFocused = found;
            found.focus({ preventScroll: false });
        }

        function renderBackdrop(): VNode {
            const data: Record<string, unknown> = {
                class: 'vue-dialog-backdrop',
                role: 'none',
                onClick: () => !(typeof props.modal === 'boolean' || !props.modal.backdropDismissible) && close()
            };

            return withDirectives(createElement('div', data), [[ vShow, props.modelValue ]]);
        }

        provide(dialogActionKey, { show, close });
        expose({ show, close });

        return () => {
            const dialogData: Record<string, unknown> = {
                ref: dialogRef,
                class: 'vue-dialog',
                role: 'dialog',
                'aria-modal': !!props.modal,
                'aria-labelledby': idUsageStatus.titleId ? titleId : null,
                'aria-describedby': idUsageStatus.subtitleId ? subtitleId : null,
                onKeydown: onTabLimitFocusSelection
            }
                , transitionData: TransitionProps = {
                name: 'vue-dialog',
                type: 'transition',
                css: true,
                mode: 'out-in',
                onBeforeEnter: () => emit('beforeOpen'),
                onAfterEnter: () => emit('opened'),
                onLeave: (el, done) => emitHaveBeenListened('beforeClose') ? emit('beforeClose', done) : done(),
                onAfterLeave: () => emit('closed')
            };

            const dialog = createElement(
                Transition,
                transitionData,
                () => withDirectives(
                    createElement(
                        'div',
                        mergeProps(dialogData, attrs),
                        slots['default']?.({ ref: getUserProvidedFocusElement })
                    ),
                    [ [ vShow, props.modelValue ] ]
                ));

            return props.modal ? [ dialog, renderBackdrop() ] : dialog;
        };
    }
});

/**
 * @see https://github.com/meshareL/vue-dialog
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
export default component as any as new() => {
    $props:
        VNodeProps
        & AllowedComponentProps
        & ComponentCustomProps
        & Omit<HTMLAttributes, 'aria-modal'>
        & Pick<Prop, 'modelValue'>
        & KebabCasedProperties<Omit<Prop, 'modelValue'>>
        & {
        'onUpdate:modelValue'?: (value: boolean) => void;
        'onBefore-open'?: () => void;
        onOpened?: () => void;
        /** 如果监听了该事件, 则必须调用 done 函数, 对话框才会完全关闭 */
        'onBefore-close'?: (done: () => void) => void;
        onClosed?: () => void;
    };

    $slots: {
        default?: () => VNode[]
    }

    show: () => void;
    close: () => void;
};
export type { Prop };
