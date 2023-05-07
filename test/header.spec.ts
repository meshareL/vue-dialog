import { describe, it, afterEach, expect, vitest } from 'vitest';
import { enableAutoUnmount, mount, shallowMount } from '@vue/test-utils';
import { dialogActionKey, fetchIdKey, pushInternalCloserKey } from '../src/key';
import Header from '../src/header';

enableAutoUnmount(afterEach);

describe('Header component', () => {
    it('create component', () => {
        const instance = mount(Header as any);
        expect(instance.exists()).toBe(true);
        expect(instance.classes('dialog-header')).toBe(true);
    });

    it('default slot', () => {
        const instance = mount(Header as any, { slots: { default: () => 'title' } });
        expect(instance.exists()).toBe(true);
        expect(instance.find('.title-bar').exists()).toBe(false);
        expect(instance.get('.title').text()).toBe('title');
    });

    it('subtitle slot', () => {
        const instance = mount(Header as any, { slots: { subtitle: () => 'subtitle' } });
        expect(instance.exists()).toBe(true);
        expect(instance.find('.title-bar').exists()).toBe(true);
        expect(instance.get('.subtitle').text()).toBe('subtitle');
    });

    it('title id', () => {
        const instance = mount(Header as any, {
            slots: { default: () => 'title' },
            global: {
                provide: { [fetchIdKey as symbol]: { titleId: () => '123' } }
            }
        });
        expect(instance.exists()).toBe(true);
        expect(instance.get('.title').attributes('id')).toBe('123');
    });

    it('subtitle id', () => {
        const instance = mount(Header as any, {
            slots: { subtitle: () => 'subtitle' },
            global: {
                provide: {
                    [fetchIdKey as symbol]: {
                        titleId: () => '123',
                        subtitleId: () => '456'
                    }
                }
            }
        });
        expect(instance.exists()).toBe(true);
        expect(instance.get('.subtitle').attributes('id')).toBe('456');
    });

    it('prop dismissible', async () => {
        const instance = shallowMount(Header as any, { props: { dismissible: true } });
        expect(instance.exists()).toBe(true);

        const button = instance.find('.closer');
        expect(button.exists()).toBe(true);
        expect(button.find('svg').exists()).toBe(true);

        await instance.setProps({ dismissible: false });
        expect(instance.find('.closer').exists()).toBe(false);
    });

    it('close button', async () => {
        const closeFun = vitest.fn()
            , instance = shallowMount(Header as any, {
            props: { dismissible: true },
            global: {
                provide: { [dialogActionKey as symbol]: { close: closeFun } }
            }
        });
        expect(instance.exists()).toBe(true);

        await instance.get('.closer').trigger('click');
        expect(closeFun).toBeCalled();
    });

    it('push closer focus fun', () => {
        let fun = null;
        const instance = shallowMount(Header as any, {
            global: {
                provide: {
                    [pushInternalCloserKey as symbol]: (f: Function) => fun = f
                }
            }
        });
        expect(instance.exists()).toBe(true);
        expect(fun).toBeDefined();
    });
});
