import { h as createElement } from 'vue';
import type { FunctionalComponent } from 'vue';
import classnames from '../css/index.module.scss';

const component: FunctionalComponent = (props, { slots }) => {
    return createElement('footer', { class: classnames.footer }, slots['default']?.());
};

component.displayName = 'VueDialogFooter';
component.inheritAttrs = true;

export default component;
