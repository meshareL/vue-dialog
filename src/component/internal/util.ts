function generateId(): string {
    return new Date().getTime().toString(16) + Math.random().toString(16).substring(2);
}

/**
 * 检查给定的元素是否可以聚焦
 *
 * @param element 给定元素
 * @return 如果给定的元素可以聚焦返回 `true`, 否则返回 `false`
 */
function isFocusable(element: Element): boolean {
    if (!(element instanceof HTMLElement)
        || element.tabIndex < 0
        || element.hidden
        || element.getAttribute('aria-hidden') === 'true'
        || element.getAttribute('aria-disabled') === 'true') {
        return false;
    }

    if (element instanceof HTMLInputElement
        || element instanceof HTMLTextAreaElement
        || element instanceof HTMLSelectElement
        || element instanceof HTMLButtonElement) {
        return !element.disabled && element.type !== 'hidden';
    }

    return true;
}

/**
 * 聚焦给定元素中第一个具有 `autofocus` 属性的元素
 *
 * @param element 给定元素
 * @return 如果成功聚焦元素返回 `true`, 否则返回 `false`
 */
function focusFirstDescendant(element: Element): boolean {
    const found = Array
        .from(element.querySelectorAll('[autofocus]'))
        .filter((el): el is HTMLElement => isFocusable(el))[0];

    if (!found) return false;

    found.focus({ preventScroll: false });
    return true;
}

export { generateId, isFocusable, focusFirstDescendant };
