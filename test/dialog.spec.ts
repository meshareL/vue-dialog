import { describe, it, afterEach, expect, vitest } from 'vitest';
import { enableAutoUnmount, mount, flushPromises } from '@vue/test-utils';
import { inject, h as createElement, defineComponent } from 'vue';
import type { FunctionalComponent } from 'vue';
import { dialogActionKey, fetchIdKey, setFocusElementRefKey } from '../src/component/internal/key';
import Dialog from '../src/component/dialog';
import { Draggable } from '@neodrag/vanilla';
import classnames from '../src/css/index.module.scss';

enableAutoUnmount(afterEach);

const { enableBodyScroll, disableBodyScroll } = vitest.hoisted(() => {
    return {
        enableBodyScroll: vitest.fn(),
        disableBodyScroll: vitest.fn()
    };
});

vitest.mock('body-scroll-lock-upgrade', async () => {
    return {
        ...(await vitest.importActual<Record<string, unknown>>('body-scroll-lock-upgrade')),
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
            expect(fetchId?.title()).toBeDefined();
            expect(fetchId?.subtitle()).toBeDefined();

            const action = inject(dialogActionKey, null);
            expect(action?.show).toBeInstanceOf(Function);
            expect(action?.close).toBeInstanceOf(Function);
            return 'Node';
        };

        const instance = mount(Dialog, {
            props: { modelValue: false },
            slots: { default: () => createElement(node) }
        });
        expect(instance.exists()).toBe(true);

        const dialog = instance.get(`.${classnames.dialog}`);
        expect(dialog.attributes('role')).toBe('dialog');
        expect(dialog.attributes('aria-modal')).toBe('false');
    });

    it('v-model', async () => {
        const instance = mount(Dialog, {
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
        const instance = mount(Dialog, { props: { modelValue: true, scrollLock: true } });
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

    describe('modal dialog', () => {
        it('modal', async () => {
            const instance = mount(Dialog, { props: { modelValue: false, modal: false } });
            expect(instance.exists()).toBe(true);

            expect(instance.get(`.${classnames.dialog}`).attributes('aria-modal')).toBe('false');
            expect(instance.find(`.${classnames.backdrop}`).exists()).toBe(false);

            await instance.setProps({ modal: true });
            expect(instance.get(`.${classnames.dialog}`).attributes('aria-modal')).toBe('true');
            expect(instance.find(`.${classnames.backdrop}`).exists()).toBe(true);

            await instance.setProps({ modal: { backdropDismissible: false } });
            expect(instance.get(`.${classnames.dialog}`).attributes('aria-modal')).toBe('true');
            expect(instance.find(`.${classnames.backdrop}`).exists()).toBe(true);

            await instance.setProps({ modal: { backdropDismissible: true } });
            expect(instance.get(`.${classnames.dialog}`).attributes('aria-modal')).toBe('true');
            expect(instance.find(`.${classnames.backdrop}`).exists()).toBe(true);
        });

        it('click backdrop', async () => {
            const instance = mount(Dialog, {
                props: {
                    modelValue: true,
                    'onUpdate:modelValue': (value: boolean) => instance.setProps({ modelValue: value }),
                    modal: true
                }
            });
            expect(instance.exists()).toBe(true);

            await instance.get(`.${classnames.backdrop}`).trigger('click');
            expect(instance.props('modelValue')).toBe(true);

            await instance.setProps({ modal: { backdropDismissible: false } });
            await instance.get(`.${classnames.backdrop}`).trigger('click');
            expect(instance.props('modelValue')).toBe(true);

            await instance.setProps({ modal: { backdropDismissible: true } });
            await instance.get(`.${classnames.backdrop}`).trigger('click');
            expect(instance.props('modelValue')).toBe(false);
        });
    });

    it('escape close', async () => {
        const instance = mount(Dialog, {
            props: {
                modelValue: true,
                'onUpdate:modelValue': (value: boolean) => instance.setProps({ modelValue: value }),
                keyboardDismissible: false
            },
            attachTo: document.body
        });
        expect(instance.exists()).toBe(true);

        await instance.get('[role="dialog"]').trigger('keydown', { key: 'Escape' });
        expect(instance.props('modelValue')).toBe(true);

        await instance.setProps({ keyboardDismissible: true });
        await instance.get('[role="dialog"]').trigger('keydown', { key: 'Escape' });
        expect(instance.props('modelValue')).toBe(false);
    });

    it('drag', async () => {
        let instance = mount(Dialog, { props: { modelValue: true, draggable: false } });
        expect(instance.exists()).toBe(true);
        expect(Draggable).not.toBeCalled();

        instance = mount(Dialog, { props: { modelValue: true, draggable: true } });
        await flushPromises();
        expect(instance.exists()).toBe(true);
        expect(Draggable).toBeCalledTimes(1);

        // @ts-expect-error ignore
        instance = mount(Dialog, { props: { modelValue: true, draggable: { relocation: false } } });
        await flushPromises();
        expect(instance.exists()).toBe(true);
        expect(Draggable).toBeCalledTimes(2);

        // @ts-expect-error ignore
        instance = mount(Dialog, { props: { modelValue: true, draggable: { relocation: true } } });
        await flushPromises();
        expect(instance.exists()).toBe(true);
        expect(Draggable).toBeCalledTimes(3);

        await instance.setProps({ modelValue: false });
        await flushPromises();
        expect(Draggable.prototype.destroy).toBeCalledTimes(1);

        await instance.setProps({ modelValue: true });
        await flushPromises();
        instance.unmount();
        expect(Draggable.prototype.destroy).toBeCalledTimes(2);
    });

    describe('focus management', () => {
        it('focus on user specified element', async () => {
            const focus = vitest.fn(),
                  instance = mount(Dialog, {
                      props: { modelValue: true },
                      slots: { default: ({ ref }) => createElement('div', { ref, focus }) }
                  });
            expect(instance.exists()).toBe(true);

            await flushPromises();
            expect(focus).toBeCalled();
        });

        it('focus on user specified component', async () => {
            const focus = vitest.fn(),
                  component = defineComponent(() => () => createElement('div', { focus })),
                  instance = mount(Dialog, {
                      props: { modelValue: true },
                      slots: { default: ({ ref }) => createElement(component, { ref }) }
                  });
            expect(instance.exists()).toBe(true);

            await flushPromises();
            expect(focus).toBeCalled();
        });

        it('no focusable element and not specified, focus close button', async () => {
            const focus = vitest.fn(),
                  component: FunctionalComponent = () => {
                      const setRef = inject(setFocusElementRefKey, null);
                      return createElement('button', { ref: el => setRef?.(el, true), focus });
                  },
                  instance = mount(Dialog, {
                      props: { modelValue: true },
                      slots: { default: () => createElement(component) }
                  });
            expect(instance.exists()).toBe(true);

            await flushPromises();
            expect(focus).toBeCalled();
        });

        it('focus on user specified element first', async () => {
            const internalFocus = vitest.fn(),
                  externalFocus = vitest.fn(),
                  component: FunctionalComponent = () => {
                      const setRef = inject(setFocusElementRefKey, null);
                      return createElement('button', { ref: el => setRef?.(el, true), focus: internalFocus });
                  },
                  instance = mount(Dialog, {
                      props: { modelValue: true },
                      slots: { default: ({ ref }) => [
                          createElement(component),
                          createElement('div', { ref, focus: externalFocus })
                      ] }
                  });
            expect(instance.exists()).toBe(true);

            await flushPromises();
            expect(internalFocus).not.toBeCalled();
            expect(externalFocus).toBeCalled();
        });

        it('first focus on the element with autofocus attribute', async () => {
            const autofocusFocus = vitest.fn(),
                  specifiedFocus = vitest.fn(),
                  instance = mount(Dialog, {
                      props: { modelValue: true },
                      slots: { default: ({ ref }) => [
                          createElement('input', { type: 'text', autofocus: true, focus: autofocusFocus }),
                          createElement('button', { ref, focus: specifiedFocus })
                      ] }
                  });
            expect(instance.exists()).toBe(true);

            await flushPromises();
            expect(specifiedFocus).not.toBeCalled();
            expect(autofocusFocus).toBeCalled();
        });

        it('focus to the last focused element when it was last opened', async () => {
            const component: FunctionalComponent = () => [
                createElement('input', { type: 'text', autofocus: true }),
                createElement('input', { type: 'email' })
            ],
                  instance = mount(Dialog, {
                      props: { modelValue: true, retainFocus: true },
                      slots: { default: () => createElement(component) },
                      attachTo: document.body
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
        });

        it('after close focuses to the element focused before open', async () => {
            document.body.innerHTML = '<button class="btn" type="button">Button</button>'
            + '<div id="root"></div>';

            const button = document.querySelector<HTMLButtonElement>('.btn');
            button?.focus();
            expect(document.activeElement).toBe(button);

            const instance = mount(Dialog, {
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
            it('moves focus to the next focusable element inside the dialog', async () => {
                const component: FunctionalComponent = () => [
                    createElement('input', { type: 'text', autofocus: true }),
                    createElement('input', { type: 'email' })
                ],
                      instance = mount(Dialog, {
                          props: { modelValue: true },
                          slots: { default: () => createElement(component) },
                          attachTo: document.body
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
                ],
                      instance = mount(Dialog, {
                          props: { modelValue: true },
                          slots: { default: () => createElement(component) },
                          attachTo: document.body
                      });
                expect(instance.exists()).toBe(true);

                await flushPromises();
                expect(document.activeElement).toBe(instance.get('input[type="email"]').element);

                await instance.get('[role="dialog"]').trigger('keydown', { key: 'Tab', shiftKey: false });
                await flushPromises();
                expect(document.activeElement).toBe(instance.get('input[type="text"]').element);
            });
        });

        describe.skip('Shift + Tab', () => {
            it('moves focus to the previous focusable element inside the dialog', async () => {
                const component: FunctionalComponent = () => [
                    createElement('input', { type: 'text' }),
                    createElement('input', { type: 'email', autofocus: true })
                ],
                      instance = mount(Dialog, {
                          props: { modelValue: true },
                          slots: { default: () => createElement(component) },
                          attachTo: document.body
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
                ],
                      instance = mount(Dialog, {
                          props: { modelValue: true },
                          slots: { default: () => createElement(component) },
                          attachTo: document.body
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
