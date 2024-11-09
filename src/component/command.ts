import { h as createElement, render, cloneVNode } from 'vue';
import type { VNode } from 'vue';
import Dialog from './dialog';
import Header from './header';
import Body from './body';
import Footer from './footer';
import { generateId } from './internal/util';
import classnames from '../css/index.module.scss';

type AlertOption = {
    title: string | VNode;
    subtitle?: string | VNode;
    content: string | VNode;
    confirmButton: VNode;
};

type ConfirmOption = AlertOption & { cancelButton: VNode };

type PromptOption = ConfirmOption & { input: VNode };

function renderHeader(option: Pick<AlertOption, 'title' | 'subtitle'>): VNode {
    return createElement(Header, { dismissible: false }, {
        default: () => option.title,
        subtitle: option.subtitle ? () => option.subtitle : null
    });
}

/**  @experimental */
function alert(option: AlertOption): Promise<void> {
    return new Promise(resolve => {
        const container = document.createElement('div');

        function eject() {
            container.remove();
            render(null, container);
            resolve();
        }

        const dialog = createElement(
            Dialog,
            {
                modelValue: true,
                modal: { backdropDismissible: true },
                keyboardDismissible: true,
                draggable: true,
                'onUpdate:modelValue': value => !value && eject()
            },
            // @ts-expect-error ignore
            { default: ({ ref: focusRef }) => [
                renderHeader(option),
                createElement(Body, () => option.content),
                createElement(Footer, () => cloneVNode(option.confirmButton, { ref: focusRef, onClick: eject }, true))
            ] }
        );

        render(dialog, container);
        document.body.append(container);
    });
}

/**  @experimental */
function confirm(option: ConfirmOption): Promise<boolean> {
    return new Promise(resolve => {
        const container = document.createElement('div');

        function eject(value: boolean) {
            container.remove();
            render(null, container);
            resolve(value);
        }

        const dialog = createElement(
            Dialog,
            {
                modelValue: true,
                modal: { backdropDismissible: true },
                keyboardDismissible: true,
                draggable: true,
                'onUpdate:modelValue': value => !value && eject(false)
            },
            // @ts-expect-error ignore
            { default: ({ ref: focusRef }) => [
                renderHeader(option),
                createElement(Body, () => option.content),
                createElement(Footer, () => [
                    cloneVNode(option.cancelButton, { class: classnames.canceler, onClick: () => eject(false) }),
                    cloneVNode(option.confirmButton, { ref: focusRef, onClick: () => eject(true) }, true)
                ])
            ] }
        );

        render(dialog, container);
        document.body.append(container);
    });
}

/**  @experimental */
function prompt(option: PromptOption): Promise<string | null> {
    return new Promise(resolve => {
        const container = document.createElement('div'),
              formId = generateId(),
              inputId = `${formId}_input`;

        function eject(value: string | null) {
            container.remove();
            render(null, container);
            resolve(value);
        }

        function onSubmit(event: SubmitEvent): void {
            const form = event.currentTarget;
            if (!(form instanceof HTMLFormElement)) return;

            const input = form.elements.namedItem(inputId);
            if (!(input instanceof HTMLInputElement)) return;

            !event.defaultPrevented && event.preventDefault();
            eject(input.value);
        }

        // @ts-expect-error ignore
        const renderForm = asProps => createElement(
            'form',
            { ...asProps, id: formId, class: classnames.form, onSubmit },
            { default: () => [
                createElement('label', { for: inputId, class: classnames.label }, option.content),
                cloneVNode(option.input, { id: inputId, autofocus: true, type: 'text' })
            ] }
        );

        const dialog = createElement(
            Dialog,
            {
                modelValue: true,
                modal: { backdropDismissible: true },
                keyboardDismissible: true,
                draggable: true,
                'onUpdate:modelValue': value => !value && eject(null)
            },
            // @ts-expect-error ignore
            { default: ({ ref: focusRef }) => [
                renderHeader(option),
                // @ts-expect-error ignore
                createElement(Body, null, { as: asProps => renderForm(asProps) }),
                createElement(Footer, () => [
                    cloneVNode(option.cancelButton, { class: classnames.canceler, type: 'button', onClick: () => eject(null) }),
                    cloneVNode(option.confirmButton, { ref: focusRef, type: 'submit', form: formId }, true)
                ])
            ] }
        );

        render(dialog, container);
        document.body.append(container);
    });
}

export { alert, confirm, prompt };
export type { AlertOption, ConfirmOption, PromptOption };
