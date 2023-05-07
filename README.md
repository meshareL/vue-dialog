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

- [Container](https://github.com/meshareL/vue-dialog/blob/master/blob/doc/container)
- [Dialog](https://github.com/meshareL/vue-dialog/blob/master/blob/doc/dialog)
- [Header](https://github.com/meshareL/vue-dialog/blob/master/blob/doc/header)
- [Body](https://github.com/meshareL/vue-dialog/blob/master/blob/doc/body)
- Footer

## License
[Apache-2.0](https://github.com/meshareL/vue-dialog/blob/master/LICENSE)
