# vue-dialog

一个 vue3 对话框组件

## 安装

```shell
npm install @tomoeed/vue-dialog --save
```

## 基础用法

```vue
<template>
<Dialog v-model="status">
  <Header>Title</Header>
  <Body>...</Body>
</Dialog>
</template>

<script setup>
import { ref } from 'vue';
import { Dialog, Header, Body } from '@tomoeed/vue-dialog';

const status = ref(false);
</script>
```

## 组件

### Dialog

| 属性                  | 类型                                          | 默认值    | 说明                                                                                                                                           |
|---------------------|---------------------------------------------|--------|----------------------------------------------------------------------------------------------------------------------------------------------|
| modelValue(v-model) | boolean                                     |        |                                                                                                                                              |
| role                | dialog \| alertdialog                       | dialog |                                                                                                                                              |
| modal               | boolean \| { backdropDismissable: boolean } |        | 是否显示为模态对话框<br>模态对话框默认不能通过点击 backdrop 区域关闭对话框, 如果需要该行为, 则需要明确传递 `backdropDismissible` 参数<br>`alertdialog` 默认是模态对话框, 并且不能通过点击 backdrop 区域关闭对话框 |
| keyboardDismissable | boolean                                     | true   | 键盘 Escape 按键是否可以关闭对话框                                                                                                                        |
| draggable           | boolean \| { relocation: boolean }          | false  | 对话框是否可拖动<br>对话框被拖动后再次打开默认不会重置定位, 如果需要该行为, 则需要明确传递 `relocation` 参数                                                                            |                                                                                                                                              |
| retainFocus         | boolean                                     | false  | 对话框关闭后是否保留此次最后聚焦的元素的焦点, 当再次打开对话框时聚焦到此元素                                                                                                      |
| scrollLock          | boolean                                     | true   | 对话框开启时, 是否锁定屏幕滚动                                                                                                                             |

| 插槽      | 参数                                                                   | 说明                         |
|---------|----------------------------------------------------------------------|----------------------------|
| default | { ref: (value: Element \| ComponentPublicInstance \| null) => void } | 通过 `ref` 属性可以指定对话框打开后聚焦的元素 |

```vue
<Dialog #default="{ ref }">
  <button type="button" :ref="ref">Close</button>
</Dialog>
```

Dialog 组件暴露了 `show` 与 `close` 方法, 可以通过这两个方法打开或关闭对话框

### Header

| 属性          | 类型      | 默认值   | 说明                                       |
|-------------|---------|-------|------------------------------------------|
| dismissible | boolean | false | 是否显示关闭对话框按钮<br>你应该总是为对话框在底部提供一个按钮用来关闭对话框 |

| 插槽       | 参数 | 说明     |
|----------|----|--------|
| default  |    |        |
| subtitle |    | 对话框副标题 |

### Body

| 插槽      | 参数     | 说明      |
|---------|--------|---------|
| default |        |         |
| as      | object | 自定义渲染内容 |

```vue
<Body #as="asProps">
  <form v-bind="asProps">...</form>
</Body>
```

### Footer

### Container

如果对话框只是用来展示一简单的些信息, 则可以配合该组件使用

| 属性          | 类型      | 默认值   | 说明        |
|-------------|---------|-------|-----------|
| defaultOpen | boolean | false | 对话框默认是否打开 |

| 插槽      | 参数                                                     | 说明 |
|---------|--------------------------------------------------------|----|
| default | { status: boolean, toggle: (value?: boolean) => void } |    |

```vue
<Container #default="{ status, toggle }">
  <Dialog :model-value="status" @update:modelValue="toggle">...</Dialog>
</Container>
```

## API (Beta)

组件库提供了 `alert`, `confirm`, `prompt` 函数, 可以使用这些方法命令式地创建对话框

> 这些方法仅用来展示较为简单的内容, 如果需要展示较为复杂的内容, 请使用 Dialog

```vue
<script setup>
import { h as createElement } from 'vue';
import { alert, confirm, prompt } from '@tomoeed/vue-dialog';

async function command() {
    const userId = await prompt({
        title: 'Delete user',
        content: 'Enter the ID to delete',
        input: createElement('input'),
        confirmButton: createElement('button', 'Confirm'),
        cancelButton: createElement('button', 'Cancel')
    });

    if (!userId) return null;

    const deleteConfirm = await confirm({
        title: 'Delete user',
        content: `Are you sure you want to delete "${userId}"?`,
        confirmButton: createElement('button', 'Confirm'),
        cancelButton: createElement('button', 'Cancel')
    });

    if (!deleteConfirm) return null;

    await alert({
        title: 'Delete user',
        content: `${userId} deleted successfully.`,
        confirmButton: createElement('button', 'Confirm'),
    });
}
</script>
<template>
  <button type="button" @click="command">Button</button>
</template>
```


## License
[Apache-2.0](https://github.com/meshareL/vue-dialog/blob/master/LICENSE)
