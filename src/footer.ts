import { h as createElement} from 'vue';
import type { FunctionalComponent } from 'vue';

const component: FunctionalComponent = (_, { slots }) => {
    const data: Record<string, unknown> = { class: 'dialog-footer' };
    return createElement('footer', data, slots['default']?.());
};

component.displayName = 'VueDialogFooter';
component.inheritAttrs = true;

export default component;
