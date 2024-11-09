import { describe, it, afterEach, expect } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { h as createElement } from 'vue';
import Container from '../src/component/container';

enableAutoUnmount(afterEach);

describe('Container component', () => {
    it('create component', () => {
        const instance = mount(Container, {
            props: { defaultOpen: true },
            slots: { default: () => 'body' }
        });

        expect(instance.exists()).toBe(true);
        expect(instance.text()).toBe('body');
    });

    it('no default slot is provided', () => {
        expect(() => mount(Container)).toThrow();
    });

    it('default slot', async () => {
        let instance = mount(Container, {
            props: { defaultOpen: false },
            slots: {
                default: ({ status, toggle }) => createElement('button', { onClick: () => toggle(true) }, status)
            }
        });
        expect(instance.exists()).toBe(true);

        let button = instance.get('button');
        expect(button.text()).toBe('false');

        await button.trigger('click');
        expect(button.text()).toBe('true');

        instance = mount(Container, {
            props: { defaultOpen: true },
            slots: {
                default: ({ status, toggle }) => createElement('button', { onClick: () => toggle(false) }, status)
            }
        });
        expect(instance.exists()).toBe(true);

        button = instance.get('button');
        expect(button.text()).toBe('true');

        await button.trigger('click');
        expect(button.text()).toBe('false');

        instance = mount(Container, {
            props: { defaultOpen: true },
            slots: {
                default: ({ status, toggle }) => createElement('button', { onClick: () => toggle() }, status)
            }
        });
        expect(instance.exists()).toBe(true);

        button = instance.get('button');
        expect(button.text()).toBe('true');

        await button.trigger('click');
        expect(button.text()).toBe('false');

        await button.trigger('click');
        expect(button.text()).toBe('true');
    });
});
