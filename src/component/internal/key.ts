import type { InjectionKey, ComponentPublicInstance, Ref } from 'vue';

type DialogAction = {
    show: () => void;
    close: () => void;
};

type FetchId = {
    title: () => string;
    subtitle: () => string;
};

type SetFocusElementRef = (element: Element | ComponentPublicInstance | null, isBuiltIn: boolean) => void;

const dialogActionKey = Symbol('VueDialog: dialog action') as InjectionKey<DialogAction>,
      dialogDraggableKey = Symbol('VueDialog: dialog draggable') as InjectionKey<Readonly<Ref<boolean>>>,
      fetchIdKey = Symbol('VueDialog: fetch id') as InjectionKey<FetchId>,
      setFocusElementRefKey = Symbol('VueDialog: set focus element ref') as InjectionKey<SetFocusElementRef>;

export { dialogActionKey, dialogDraggableKey, fetchIdKey, setFocusElementRefKey };
export type { DialogAction, FetchId };
