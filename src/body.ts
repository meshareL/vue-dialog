import { h as createElement } from 'vue';
import type { FunctionalComponent } from 'vue';

type Prop = {
    /** 如果你想要将该组件渲染为非 `div` 标签, 则指定该参数 (如: form) */
    as?: string;
};

const component: FunctionalComponent<Prop> = (props, { slots }) => {
    const data: Record<string, unknown> = { class: 'dialog-body' };
    return createElement(props.as!, data, slots['default']?.());
};

component.displayName = 'VueDialogBody';
component.inheritAttrs = true;
component.props = { as: { type: String, required: false, default: 'div' } };

export default component;
export type { Prop };
