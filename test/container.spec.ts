import { describe, it, afterEach, expect } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { h as createElement} from 'vue';
import Container from '../src/container';

enableAutoUnmount(afterEach);

describe('Container component', () => {
    it('create component', () => {
        const instance = mount(Container as any, {
            props: { defaultOpen: true },
            slots: { default:() => 'body' }
        });

        expect(instance.exists()).toBe(true);
        expect(instance.text()).toBe('body');
    });

    it('no default slot is provided', () => {
        expect(() => mount(Container as any)).toThrow();
    });

    it('default slot', async () => {
        let instance = mount(Container as any, {
            props: { defaultOpen: false },
            slots: {
                default: ({ status, changeStatus }) => createElement('button', { onClick: () => changeStatus(true) }, status)
            }
        });
        expect(instance.exists()).toBe(true);

        let button = instance.get('button');
        expect(button.text()).toBe('false');

        await button.trigger('click');
        expect(button.text()).toBe('true');

        instance = mount(Container as any, {
            props: { defaultOpen: true },
            slots: {
                default: ({ status, changeStatus }) => createElement('button', { onClick: () => changeStatus(false) }, status)
            }
        });
        expect(instance.exists()).toBe(true);

        button = instance.get('button');
        expect(button.text()).toBe('true');

        await button.trigger('click');
        expect(button.text()).toBe('false');

        instance = mount(Container as any, {
            props: { defaultOpen: true },
            slots: {
                default: ({ status, changeStatus }) => createElement('button', { onClick: () => changeStatus() }, status)
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
