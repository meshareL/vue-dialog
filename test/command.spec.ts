import { describe, afterEach, it, expect, vitest } from 'vitest';
import { enableAutoUnmount, flushPromises } from '@vue/test-utils';
import { h as createElement } from 'vue';
import { alert, confirm, prompt } from '../src/component/command';
import classnames from '../src/css/index.module.scss';

enableAutoUnmount(afterEach);

describe('command dialog', () => {
    it('alert dialog', async () => {
        const _alert = vitest.fn(alert);
        _alert({
            title: 'title',
            subtitle: 'subtitle',
            content: 'content',
            confirmButton: createElement('button')
        });

        expect(document.querySelector(`.${classnames.title}`)?.textContent).toBe('title');
        expect(document.querySelector(`.${classnames.subtitle}`)?.textContent).toBe('subtitle');
        expect(document.querySelector(`.${classnames.body}`)?.textContent).toBe('content');
        expect(document.querySelector(`.${classnames.backdrop}`)).toBeDefined();

        document.querySelector('button')?.click();
        await flushPromises();
        expect(_alert).toHaveResolved();
    });

    it('alert dialog click backdrop', async () => {
        const _alert = vitest.fn(alert);
        _alert({
            title: 'title',
            content: 'content',
            confirmButton: createElement('button')
        });

        document.querySelector<HTMLElement>(`.${classnames.backdrop}`)?.click();
        await flushPromises();
        expect(_alert).toHaveResolved();
    });

    it('alert dialog escape', async () => {
        const _alert = vitest.fn(alert);
        _alert({
            title: 'title',
            content: 'content',
            confirmButton: createElement('button')
        });

        document.querySelector(`.${classnames.dialog}`)?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        await flushPromises();
        expect(_alert).toHaveResolved();
    });

    it('confirm dialog click confirm button', async () => {
        const _confirm = vitest.fn(confirm);
        _confirm({
            title: 'title',
            subtitle: 'subtitle',
            content: 'content',
            confirmButton: createElement('button', { 'data-confirm-button': '' }),
            cancelButton: createElement('button', { 'data-cancel-button': '' })
        });

        expect(document.querySelector(`.${classnames.title}`)?.textContent).toBe('title');
        expect(document.querySelector(`.${classnames.subtitle}`)?.textContent).toBe('subtitle');
        expect(document.querySelector(`.${classnames.body}`)?.textContent).toBe('content');
        expect(document.querySelector(`.${classnames.backdrop}`)).toBeDefined();
        expect(document.querySelector('[data-cancel-button]')).toBeDefined();

        document.querySelector<HTMLButtonElement>('[data-confirm-button]')?.click();
        await flushPromises();
        expect(_confirm).toHaveResolvedWith(true);
    });

    it('confirm dialog click cancel button', async () => {
        const _confirm = vitest.fn(confirm);
        _confirm({
            title: 'title',
            subtitle: 'subtitle',
            content: 'content',
            confirmButton: createElement('button', { 'data-confirm-button': '' }),
            cancelButton: createElement('button', { 'data-cancel-button': '' })
        });

        document.querySelector<HTMLButtonElement>('[data-cancel-button]')?.click();
        await flushPromises();
        expect(_confirm).toHaveResolvedWith(false);
    });

    it('confirm dialog click backdrop', async () => {
        const _confirm = vitest.fn(confirm);
        _confirm({
            title: 'title',
            content: 'content',
            confirmButton: createElement('button', { 'data-confirm-button': '' }),
            cancelButton: createElement('button', { 'data-cancel-button': '' })
        });

        document.querySelector<HTMLElement>(`.${classnames.backdrop}`)?.click();
        await flushPromises();
        expect(_confirm).toHaveResolvedWith(false);
    });

    it('confirm dialog escape', async () => {
        const _confirm = vitest.fn(confirm);
        _confirm({
            title: 'title',
            content: 'content',
            confirmButton: createElement('button', { 'data-confirm-button': '' }),
            cancelButton: createElement('button', { 'data-cancel-button': '' })
        });

        document.querySelector(`.${classnames.dialog}`)?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        await flushPromises();
        expect(_confirm).toHaveResolvedWith(false);
    });

    it('prompt dialog click confirm button', async () => {
        const _prompt = vitest.fn(prompt);
        _prompt({
            title: 'title',
            subtitle: 'subtitle',
            content: 'content',
            confirmButton: createElement('button', { 'data-confirm-button': '' }),
            cancelButton: createElement('button', { 'data-cancel-button': '' }),
            input: createElement('input', { value: 'input' })
        });

        expect(document.querySelector(`.${classnames.title}`)?.textContent).toBe('title');
        expect(document.querySelector(`.${classnames.subtitle}`)?.textContent).toBe('subtitle');
        expect(document.querySelector(`.${classnames.label}`)?.textContent).toBe('content');
        expect(document.querySelector(`.${classnames.backdrop}`)).toBeDefined();
        expect(document.querySelector('input')).toBeDefined();
        expect(document.querySelector('[data-cancel-button]')).toBeDefined();

        document.querySelector<HTMLButtonElement>('[data-confirm-button]')?.click();
        await flushPromises();
        expect(_prompt).toHaveResolvedWith('input');
    });

    it('prompt dialog click cancel button', async () => {
        const _prompt = vitest.fn(prompt);
        _prompt({
            title: 'title',
            subtitle: 'subtitle',
            content: 'content',
            confirmButton: createElement('button', { 'data-confirm-button': '' }),
            cancelButton: createElement('button', { 'data-cancel-button': '' }),
            input: createElement('input', { value: 'input' })
        });

        document.querySelector<HTMLButtonElement>('[data-cancel-button]')?.click();
        await flushPromises();
        expect(_prompt).toHaveResolvedWith(null);
    });

    it('prompt dialog click backdrop', async () => {
        const _prompt = vitest.fn(prompt);
        _prompt({
            title: 'title',
            content: 'content',
            confirmButton: createElement('button', { 'data-confirm-button': '' }),
            cancelButton: createElement('button', { 'data-cancel-button': '' }),
            input: createElement('input', { value: 'input' })
        });

        document.querySelector<HTMLButtonElement>(`.${classnames.backdrop}`)?.click();
        await flushPromises();
        expect(_prompt).toHaveResolvedWith(null);
    });

    it('prompt dialog escape', async () => {
        const _prompt = vitest.fn(prompt);
        _prompt({
            title: 'title',
            content: 'content',
            confirmButton: createElement('button', { 'data-confirm-button': '' }),
            cancelButton: createElement('button', { 'data-cancel-button': '' }),
            input: createElement('input', { value: 'input' })
        });

        document.querySelector(`.${classnames.dialog}`)?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        await flushPromises();
        expect(_prompt).toHaveResolvedWith(null);
    });

    it('no subtitle', () => {
        const _alert = vitest.fn(alert);
        _alert({
            title: 'title',
            content: 'content',
            confirmButton: createElement('button')
        });

        expect(document.querySelector(`.${classnames.subtitle}`)).toBe(null);
        document.querySelector('button')?.click();
    });
});
