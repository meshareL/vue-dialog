import { describe, it, afterEach, expect } from 'vitest';
import { enableAutoUnmount, shallowMount, mount } from '@vue/test-utils';
import Footer from '../src/component/footer';
import classnames from '../src/css/index.module.scss';

enableAutoUnmount(afterEach);

describe('Footer component', () => {
    it('create component', () => {
        const instance = shallowMount(Footer);

        expect(instance.exists()).toBe(true);
        expect(instance.classes(classnames.footer)).toBe(true);
    });

    it('default slot', () => {
        const instance = mount(Footer, { slots: { default: () => 'text' } });

        expect(instance.exists()).toBe(true);
        expect(instance.text()).toBe('text');
    });
});
