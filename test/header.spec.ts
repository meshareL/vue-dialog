import { describe, it, afterEach, expect, vitest } from 'vitest';
import { enableAutoUnmount, mount, shallowMount } from '@vue/test-utils';
import { dialogActionKey, fetchIdKey, setFocusElementRefKey } from '../src/component/internal/key';
import Header from '../src/component/header';
import classnames from '../src/css/index.module.scss';

enableAutoUnmount(afterEach);

describe('Header component', () => {
    it('create component', () => {
        const instance = mount(Header);
        expect(instance.exists()).toBe(true);
        expect(instance.classes(classnames.header)).toBe(true);
    });

    it('default slot', () => {
        const instance = mount(Header, { slots: { default: () => 'title' } });
        expect(instance.exists()).toBe(true);
        expect(instance.get(`.${classnames.title}`).text()).toBe('title');
    });

    it('subtitle slot', () => {
        const instance = mount(Header, { slots: { subtitle: () => 'subtitle' } });
        expect(instance.exists()).toBe(true);
        expect(instance.get(`.${classnames.subtitle}`).text()).toBe('subtitle');
    });

    it('title id', () => {
        const instance = mount(Header, {
            slots: { default: () => 'title' },
            global: { provide: { [fetchIdKey as symbol]: { title: () => '123' } } }
        });
        expect(instance.exists()).toBe(true);
        expect(instance.get(`.${classnames.title}`).attributes('id')).toBe('123');
    });

    it('subtitle id', () => {
        const instance = mount(Header, {
            slots: { subtitle: () => 'subtitle' },
            global: { provide: { [fetchIdKey as symbol]: { title: () => '123', subtitle: () => '456' } }
            }
        });
        expect(instance.exists()).toBe(true);
        expect(instance.get(`.${classnames.subtitle}`).attributes('id')).toBe('456');
    });

    it('prop dismissible', async () => {
        const instance = shallowMount(Header, { props: { dismissible: true } });
        expect(instance.exists()).toBe(true);
        expect(instance.get(`.${classnames.closer}`).find('svg').exists()).toBe(true);

        await instance.setProps({ dismissible: false });
        expect(instance.find(`.${classnames.closer}`).exists()).toBe(false);
    });

    it('close button', async () => {
        const closeFun = vitest.fn(),
              instance = shallowMount(Header, {
                  props: { dismissible: true },
                  global: { provide: { [dialogActionKey as symbol]: { close: closeFun } } }
              });
        expect(instance.exists()).toBe(true);

        await instance.get(`.${classnames.closer}`).trigger('click');
        expect(closeFun).toBeCalled();
    });

    it('render close button is rendered, setFocusElementRef is called', () => {
        const setFocusElementRef = vitest.fn();
        const instance = shallowMount(Header, {
            props: { dismissible: true },
            global: { provide: { [setFocusElementRefKey as symbol]: setFocusElementRef } }
        });
        expect(instance.exists()).toBe(true);
        expect(setFocusElementRef).toBeCalled();
    });
});
