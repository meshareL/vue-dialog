import { h as createElement, mergeProps } from 'vue';
import type { FunctionalComponent } from 'vue';
import classnames from '../css/index.module.scss';

const component: FunctionalComponent = (props, { attrs, slots }) => {
    const data: Record<string, unknown> = mergeProps(attrs, { class: classnames.body });

    return slots['as']
        ? slots['as'](data)
        : createElement('div', data, slots['default']?.());
};

component.displayName = 'VueDialogBody';
component.inheritAttrs = false;

export default component;
