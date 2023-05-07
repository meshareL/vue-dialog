import type { InjectionKey } from 'vue';

type DialogAction = {
    show: () => void;
    close: () => void;
};

type FetchId = {
    titleId: () => string;
    subtitleId: () => string;
};

const dialogActionKey = Symbol('dialog action') as InjectionKey<DialogAction>
    , fetchIdKey = Symbol('fetch id') as InjectionKey<FetchId>
    , pushInternalCloserKey = Symbol('push internal closer') as InjectionKey<(fun: () => boolean) => void>;

export { dialogActionKey, fetchIdKey, pushInternalCloserKey };
export type { DialogAction, FetchId };
