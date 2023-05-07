import { describe, it, afterEach, expect } from 'vitest';
import { enableAutoUnmount, shallowMount, mount } from '@vue/test-utils';
import Footer from '../src/footer';

enableAutoUnmount(afterEach);

describe('Footer component', () => {
    it('create component', () => {
        const instance = shallowMount(Footer);

        expect(instance.exists()).toBe(true);
        expect(instance.classes('dialog-footer')).toBe(true);
    });

    it('default slot', () => {
        const instance = mount(Footer, { slots: { default: () => 'text' } });

        expect(instance.exists()).toBe(true);
        expect(instance.text()).toBe('text');
    });
});
