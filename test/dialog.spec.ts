import { describe, it, beforeEach, afterEach, expect, vitest } from 'vitest';
import { enableAutoUnmount, mount, flushPromises } from '@vue/test-utils';
import { inject, h as createElement, defineComponent } from 'vue';
import type { FunctionalComponent } from 'vue';
import { dialogActionKey, fetchIdKey, pushInternalCloserKey } from '../src/key';
import Dialog from '../src/dialog';
import { Draggable } from '@neodrag/vanilla';

enableAutoUnmount(afterEach);

const { enableBodyScroll, disableBodyScroll } = vitest.hoisted(() => {
    return {
        enableBodyScroll: vitest.fn(),
        disableBodyScroll: vitest.fn()
    };
});

vitest.mock('body-scroll-lock-upgrade', async () => {
    return {
        ...(await vitest.importActual<{}>('body-scroll-lock-upgrade')),
        enableBodyScroll,
        disableBodyScroll
    };
});

vitest.mock('@neodrag/vanilla', () => {
    const draggable = vitest.fn();
    draggable.prototype.destroy = vitest.fn();
    return { Draggable: draggable };
});

describe('Dialog component', () => {
    it('create component', () => {
        const node: FunctionalComponent = () => {
            const fetchId = inject(fetchIdKey, null);
            expect(fetchId?.titleId()).toBeDefined();
            expect(fetchId?.subtitleId()).toBeDefined();

            const action = inject(dialogActionKey, null);
            expect(action?.show).toBeInstanceOf(Function);
            expect(action?.close).toBeInstanceOf(Function);
            return 'Node';
        };

        const instance = mount(Dialog as any, {
            props: { modelValue: false },
            slots: { default: () => createElement(node) }
        });
        expect(instance.exists()).toBe(true);

        const dialog = instance.get('.vue-dialog');
        expect(dialog.classes('vue-dialog')).toBe(true);
        expect(dialog.attributes('role')).toBe('dialog');
        expect(dialog.attributes('aria-modal')).toBe('false');
    });

    it('v-model', async () => {
        const instance = mount(Dialog as any, {
            props: {
                modelValue: false,
                'onUpdate:modelValue': (value: boolean) => instance.setProps({ modelValue: value })
            }
        });
        expect(instance.exists()).toBe(true);

        instance.vm.show();
        await flushPromises();
        expect(instance.props('modelValue')).toBe(true);

        instance.vm.close();
        await flushPromises();
        expect(instance.props('modelValue')).toBe(false);
    });

    it('lock scroll', async () => {
        const instance = mount(Dialog as any, { props: { modelValue: true, scrollLock: true } });
        expect(instance.exists()).toBe(true);
        expect(disableBodyScroll).toBeCalled();

        await instance.setProps({ modelValue: false });
        expect(enableBodyScroll).toBeCalled();

        disableBodyScroll.mockClear();
        enableBodyScroll.mockClear();

        await instance.setProps({ modelValue: true, scrollLock: false });
        await instance.setProps({ modelValue: false });
        expect(disableBodyScroll).not.toBeCalled();
        expect(enableBodyScroll).not.toBeCalled();
    });

    it('beforeClose event not listened, not emit', async () => {
        const instance = mount(Dialog as any, {
            props: { modelValue: true },
            global: { stubs: { transition: false } }
        });
        expect(instance.exists()).toBe(true);

        await instance.setProps({ modelValue: false });
        expect(instance.emitted()).not.toHaveProperty('beforeClose');
    });

    describe('modal dialog', () => {
        it('modal', async () => {
            const instance = mount(Dialog as any, { props: { modelValue: false, modal: false } });
            expect(instance.exists()).toBe(true);

            expect(instance.get('.vue-dialog').attributes('aria-modal')).toBe('false');
            expect(instance.find('.vue-dialog-backdrop').exists()).toBe(false);

            await instance.setProps({ modal: true });
            expect(instance.get('.vue-dialog').attributes('aria-modal')).toBe('true');
            expect(instance.find('.vue-dialog-backdrop').exists()).toBe(true);

            await instance.setProps({ modal: { backdropDismissible: false } });
            expect(instance.get('.vue-dialog').attributes('aria-modal')).toBe('true');
            expect(instance.find('.vue-dialog-backdrop').exists()).toBe(true);

            await instance.setProps({ modal: { backdropDismissible: true } });
            expect(instance.get('.vue-dialog').attributes('aria-modal')).toBe('true');
            expect(instance.find('.vue-dialog-backdrop').exists()).toBe(true);
        });

        it('backdrop close dialog', async () => {
            const instance = mount(Dialog as any, {
                props: {
                    modelValue: true,
                    'onUpdate:modelValue': (value: boolean) => instance.setProps({ modelValue: value }),
                    modal: false
                }
            });
            expect(instance.exists()).toBe(true);

            expect(instance.find('.vue-dialog-backdrop').exists()).toBe(false);

            await instance.setProps({ modal: true });
            await instance.get('.vue-dialog-backdrop').trigger('click');
            expect(instance.props('modelValue')).toBe(true);

            await instance.setProps({ modal: { backdropDismissible: false } });
            await instance.get('.vue-dialog-backdrop').trigger('click');
            expect(instance.props('modelValue')).toBe(true);

            await instance.setProps({ modal: { backdropDismissible: true } });
            await instance.get('.vue-dialog-backdrop').trigger('click');
            expect(instance.props('modelValue')).toBe(false);
        });
    });

    it('escape close', async () => {
        document.body.innerHTML = '<div id="root"></div>';

        const removeEventListener = vitest.spyOn(document, 'removeEventListener')
            , instance = mount(Dialog as any, {
            props: {
                modelValue: true,
                'onUpdate:modelValue': (value: boolean) => instance.setProps({ modelValue: value }),
                keyboardDismissible: false
            },
            attachTo: '#root'
        });
        expect(instance.exists()).toBe(true);

        await instance.get('[role="dialog"]').trigger('keyup', { key: 'Escape' });
        expect(instance.props('modelValue')).toBe(true);

        await instance.setProps({ modelValue: false, keyboardDismissible: true });
        await instance.setProps({ modelValue: true });
        await instance.trigger('keyup', { key: 'Escape' });
        expect(instance.props('modelValue')).toBe(false);

        await instance.setProps({ modelValue: true, keyboardDismissible: undefined, modal: false });
        await instance.trigger('keyup', { key: 'Escape' });
        expect(instance.props('modelValue')).toBe(true);

        await instance.setProps({ modelValue: false, modal: true });
        await instance.setProps({ modelValue: true });
        await instance.trigger('keyup', { key: 'Escape' });
        expect(instance.props('modelValue')).toBe(false);
        expect(removeEventListener).toBeCalled();

        await instance.setProps({ modelValue: true, modal: { backdropDismissible: false } });
        await instance.trigger('keyup', { key: 'Escape' });
        expect(instance.props('modelValue')).toBe(false);

        removeEventListener.mockClear();
        await instance.setProps({ modelValue: true, modal: { backdropDismissible: true } });
        await instance.trigger('keyup', { key: 'Escape' });
        expect(instance.props('modelValue')).toBe(false);
        expect(removeEventListener).toBeCalled();

        removeEventListener.mockClear();
        instance.unmount();
        expect(removeEventListener).toBeCalled();

        document.body.innerHTML = '';
    });

    it('drag', async () => {
        let instance = mount(Dialog as any, { props: { modelValue: true, draggable: false } });
        expect(instance.exists()).toBe(true);
        expect(Draggable).not.toBeCalled();

        instance = mount(Dialog as any, { props: { modelValue: true, draggable: true } });
        expect(instance.exists()).toBe(true);
        expect(Draggable).toBeCalledTimes(1);

        instance = mount(Dialog as any, { props: { modelValue: true, draggable: { relocation: false } } });
        expect(instance.exists()).toBe(true);
        expect(Draggable).toBeCalledTimes(2);

        instance = mount(Dialog as any, { props: { modelValue: true, draggable: { relocation: true } } });
        expect(instance.exists()).toBe(true);
        expect(Draggable).toBeCalledTimes(3);

        await instance.setProps({ modelValue: false });
        expect(Draggable).toBeCalledTimes(4);
        expect(Draggable.prototype.destroy).toBeCalledTimes(1);

        instance.unmount();
        expect(Draggable.prototype.destroy).toBeCalledTimes(2);
    });

    describe('focus management', () => {
        it('focus on user specified HTMLElement', async () => {
            const focus = vitest.fn()
                , instance = mount(Dialog as any, {
                props: { modelValue: true },
                slots: { default: ({ ref }) => createElement('div', { ref, focus }) }
            });
            expect(instance.exists()).toBe(true);

            await flushPromises();
            expect(focus).toBeCalled();
        });

        it('focus on user specified component', async () => {
            const focus = vitest.fn()
                , component = defineComponent(() => () => createElement('div', { focus }))
                , instance = mount(Dialog as any, {
                props: { modelValue: true },
                slots: { default: ({ ref }) => createElement(component, { ref }) }
            });
            expect(instance.exists()).toBe(true);

            await flushPromises();
            expect(focus).toBeCalled();
        });

        it('user not provide focus element, focus close button (mock header component)', async () => {
            const focus = vitest.fn()
                , component: FunctionalComponent = () => {
                inject(pushInternalCloserKey)?.(focus);
                return 'Node';
            }
                , instance = mount(Dialog as any, {
                props: { modelValue: true },
                slots: { default: () => createElement(component) }
            });
            expect(instance.exists()).toBe(true);

            await flushPromises();
            expect(focus).toBeCalled();
        });

        it('focus on user provided element first', async () => {
            const headerElementFocus = vitest.fn()
                , userProvidedElementFocus = vitest.fn()
                , component: FunctionalComponent = () => {
                inject(pushInternalCloserKey)?.(headerElementFocus);
                return 'Node';
            }
                , instance = mount(Dialog as any, {
                props: { modelValue: true },
                slots: { default: ({ ref }) => [
                        createElement(component),
                        createElement('div', { ref, focus: userProvidedElementFocus })
                    ] }
            });
            expect(instance.exists()).toBe(true);

            await flushPromises();
            expect(headerElementFocus).not.toBeCalled();
            expect(userProvidedElementFocus).toBeCalled();
        });

        it('first focus on the element with autofocus attribute', async () => {
            const focus = vitest.fn()
                , instance = mount(Dialog as any, {
                props: { modelValue: true },
                slots: { default: () => createElement('input', { type: 'text', autofocus: true, focus }) }
            });
            expect(instance.exists()).toBe(true);

            await flushPromises();
            expect(focus).toBeCalled();
        });

        it('focus on element with autofocus attribute first', async () => {
            const autofocusFocus = vitest.fn()
                , providedFocus = vitest.fn()
                , headerFocus = vitest.fn()
                , component: FunctionalComponent = () => {
                inject(pushInternalCloserKey)?.(headerFocus);
                return 'Node';
            }
                , instance = mount(Dialog as any, {
                props: { modelValue: true },
                slots: { default: ({ ref }) => [
                    createElement(component),
                    createElement('div', { ref, focus: providedFocus }),
                    createElement('input', { type: 'text', autofocus: true, focus: autofocusFocus })
                    ] }
            });
            expect(instance.exists()).toBe(true);

            await flushPromises();
            expect(headerFocus).not.toBeCalled();
            expect(providedFocus).not.toBeCalled();
            expect(autofocusFocus).toBeCalled();
        });

        it('no autofocus, closer, user element, focus dialog itself', async () => {
            const focus = vitest.fn()
                , instance = mount(Dialog as any, { props: { modelValue: true }, attrs: { focus } });
            expect(instance.exists()).toBe(true);

            await flushPromises();
            expect(focus).toBeCalled();
        });

        it('focus to the last focused element when it was last opened', async () => {
            document.body.innerHTML = '<div id="root"></div>';

            const component:FunctionalComponent = () => [
                createElement('input', { type: 'text', autofocus: true }),
                createElement('input', { type: 'email' })
            ]
                , instance = mount(Dialog as any, {
                props: { modelValue: true, retainFocus: true },
                slots: { default: () => createElement(component) },
                attachTo: '#root'
            });
            expect(instance.exists()).toBe(true);

            await flushPromises();
            await instance.get('[role="dialog"]').trigger('keydown', { key: 'Tab', shiftKey: false });
            await flushPromises();
            await instance.setProps({ modelValue: false });
            await flushPromises();
            await instance.setProps({ modelValue: true });
            await flushPromises();

            expect(document.activeElement).toBe(instance.get('input[type="email"]').element);

            document.body.innerHTML = '';
        });

        it('after close focuses to the element focused before open', async () => {
            document.body.innerHTML = '<button class="btn" type="button">Button</button>' +
                                      '<div id="root"></div>';

            const button = document.querySelector<HTMLButtonElement>('.btn');
            button?.focus();
            expect(document.activeElement).toBe(button);

            const instance = mount(Dialog as any, {
                props: { modelValue: true },
                slots: { default: () => createElement('input', { type: 'text', autofocus: true }) },
                attachTo: '#root'
            });
            expect(instance.exists()).toBe(true);

            await flushPromises();
            expect(document.activeElement).toBe(instance.get('input[type="text"]').element);

            await instance.setProps({ modelValue: false });
            await flushPromises();
            expect(document.activeElement).toBe(button);

            document.body.innerHTML = '';
        });

        describe('Tab', () => {
            beforeEach(() => {
                document.body.innerHTML = '<div id="root"></div>';
            });

            afterEach(() => {
                document.body.innerHTML = '';
            });

            it('moves focus to the next focusable element inside the dialog', async () => {
                const component: FunctionalComponent = () => [
                    createElement('input', { type: 'text', autofocus: true }),
                    createElement('input', { type: 'email' })
                ]
                    , instance = mount(Dialog as any, {
                    props: { modelValue: true },
                    slots: { default: () => createElement(component) },
                    attachTo: '#root'
                });
                expect(instance.exists()).toBe(true);

                await flushPromises();
                expect(document.activeElement).toBe(instance.get('input[type="text"]').element);

                await instance.get('[role="dialog"]').trigger('keydown', { key: 'Tab', shiftKey: false });
                await flushPromises();
                expect(document.activeElement).toBe(instance.get('input[type="email"]').element);
            });

            it('focus on the last focusable element, move focus to first focusable element', async () => {
                const component: FunctionalComponent = () => [
                    createElement('input', { type: 'text' }),
                    createElement('input', { type: 'email', autofocus: true })
                ]
                    , instance = mount(Dialog as any, {
                    props: { modelValue: true },
                    slots: { default: () => createElement(component) },
                    attachTo: '#root'
                });
                expect(instance.exists()).toBe(true);

                await flushPromises();
                expect(document.activeElement).toBe(instance.get('input[type="email"]').element);

                await instance.get('[role="dialog"]').trigger('keydown', { key: 'Tab', shiftKey: false });
                await flushPromises();
                expect(document.activeElement).toBe(instance.get('input[type="text"]').element);
            });
        });

        describe('Shift + Tab', () => {
            beforeEach(() => {
                document.body.innerHTML = '<div id="root"></div>';
            });

            afterEach(() => {
                document.body.innerHTML = '';
            });

            it('moves focus to the previous focusable element inside the dialog', async () => {
                const component: FunctionalComponent = () => [
                    createElement('input', { type: 'text' }),
                    createElement('input', { type: 'email', autofocus: true })
                ]
                    , instance = mount(Dialog as any, {
                    props: { modelValue: true },
                    slots: { default: () => createElement(component) },
                    attachTo: '#root'
                });
                expect(instance.exists()).toBe(true);

                await flushPromises();
                expect(document.activeElement).toBe(instance.get('input[type="email"]').element);

                await instance.get('[role="dialog"]').trigger('keydown', { key: 'Tab', shiftKey: true });
                await flushPromises();
                expect(document.activeElement).toBe(instance.get('input[type="text"]').element);
            });

            it('focus on the first focusable element, move focus to next focusable element', async () => {
                const component: FunctionalComponent = () => [
                    createElement('input', { type: 'text', autofocus: true }),
                    createElement('input', { type: 'email' })
                ]
                    , instance = mount(Dialog as any, {
                    props: { modelValue: true },
                    slots: { default: () => createElement(component) },
                    attachTo: '#root'
                });
                expect(instance.exists()).toBe(true);

                await flushPromises();
                expect(document.activeElement).toBe(instance.get('input[type="text"]').element);

                await instance.get('[role="dialog"]').trigger('keydown', { key: 'Tab', shiftKey: true });
                await flushPromises();
                expect(document.activeElement).toBe(instance.get('input[type="email"]').element);
            });
        });
    });
});
