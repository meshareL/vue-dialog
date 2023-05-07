## 示例

```vue
<template>
<Dialog v-model="status"
        :modal="{ backdropDismissible: true }"
        :draggable="{ relocation: true }"
        keyboard-dismissible
        scroll-lock>
  ...
</Dialog>
</template>

<script setup>
import { ref } from 'vue';
import { Dialog } from '@tomoeed/vue-dialog';

const status = ref(false);
</script>
```

## 指定聚焦元素

对话框打开后, 会首先寻找具有 `autofocus` 属性的元素, 如果不存在则会尝试聚焦用户指定的元素,
如果依然不存在则会尝试聚焦 `Header` 组件的关闭按钮, 最后会尝试聚焦对话框自身

你可以使用默认插槽的 `ref` prop 指定你想要聚焦的元素

```vue
<template>
<Dialog v-model="status"
        #default="{ ref }">
  <button :ref="ref" type="button">Button</button>
</Dialog>
</template>

<script setup>
import { ref } from 'vue';
import { Dialog } from '@tomoeed/vue-dialog';

const status = ref(false);
</script>
```

## Props

| Prop                | 说明                                                                                             | 类型                                            | 默认值   |
|---------------------|------------------------------------------------------------------------------------------------|-----------------------------------------------|-------|
| modal               | 是否显示为模态对话框<br>模态对话框默认不能通过点击 backdrop 区域关闭对话框. 如果需要该行为, 则需要明确传递 `backdropDismissible` 参数        | boolean \| { backdropDismissible?: boolean; } | false |
| keyboardDismissible | 键盘 Escape 按键是否可以关闭对话框<br>当使用模态对话框时, 默认可以通过 Escape 键关闭对话框<br>当使用非模态对话框时, 则默认不可以通过 Escape 键关闭对话框 | boolean                                       |       |
| draggable           | 对话框是否可拖动<br>对话框被拖动后再次打开默认不会重置定位, 如果需要该行为, 则需要明确传递 `relocation` 参数                              | boolean \| { relocation?: boolean; }          | false | 
| retainFocus         | 对话框关闭后是否保留此次最后聚焦的元素的焦点, 当再次打开对话框时聚焦到此元素                                                        | boolean                                       | false |
| scrollLock          | 对话框开启时, 是否锁定屏幕滚动                                                                               | boolean                                       | true  |

## Events

| 事件名          | 说明                                                 | 类型                         |
|--------------|----------------------------------------------------|----------------------------|
| before-open  | 对话框打开动画开始前回调                                       | () => void                 |
| opened       | 对话框打开动画已结束回调                                       | () => void                 |
| before-close | 对话框关闭动画开始前回调, 如果监听了该事件, 则必须调用 `done` 函数, 对话框才会完全关闭 | (done: () => void) => void |
| closed       | 对话框关闭动画已结束回调                                       | () => void                 |

## Slots

| 插槽名     | 说明 | Props                                                       |
|---------|----|-------------------------------------------------------------|
| default |    | { ref: (node: Element \| ComponentPublicInstance) => void } |
