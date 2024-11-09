import { describe, it, afterEach, expect } from 'vitest';
import { enableAutoUnmount, shallowMount, mount } from '@vue/test-utils';
import { h as createElement } from 'vue';
import Body from '../src/component/body';
import classnames from '../src/css/index.module.scss';

enableAutoUnmount(afterEach);

describe('Body component', () => {
    it('create component', () => {
        const instance = shallowMount(Body);

        expect(instance.exists()).toBe(true);
        expect(instance.classes(classnames.body)).toBe(true);
    });

    it('default slot', () => {
        const instance = mount(Body, { slots: { default: () => 'text' } });

        expect(instance.exists()).toBe(true);
        expect(instance.text()).toBe('text');
    });

    it('as slot', () => {
        const instance = mount(Body, { slots: { as: asProps => createElement('form', asProps) } });

        expect(instance.exists()).toBe(true);
        expect(instance.get('form').classes(classnames.body)).toBe(true);
    });
});
