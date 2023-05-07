import { describe, it, afterEach, expect } from 'vitest';
import { enableAutoUnmount, shallowMount, mount } from '@vue/test-utils';
import Body from '../src/body';

enableAutoUnmount(afterEach);

describe('Body component', () => {
    it('create component', () => {
        const instance = shallowMount(Body);

        expect(instance.exists()).toBe(true);
        expect(instance.classes('dialog-body')).toBe(true);
    });

    it('prop as', async () => {
        const instance = shallowMount(Body);

        expect(instance.exists()).toBe(true);
        expect(instance.element.nodeName).toBe('DIV');

        await instance.setProps({ as: 'form' });
        expect(instance.element.nodeName).toBe('FORM');
    });

    it('default slot', () => {
        const instance = mount(Body, { slots: { default: () => 'text' } });

        expect(instance.exists()).toBe(true);
        expect(instance.text()).toBe('text');
    });
});
