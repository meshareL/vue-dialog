## 示例

```vue
<template>
<Dialog v-model="status">
  <Header>
    Title
    <template #subtitle>Subtitle</template>
  </Header>
  ...
</Dialog>
</template>

<script setup>
import { ref } from 'vue';
import { Dialog, Header } from '@tomoeed/vue-dialog';

const status = ref(false);
</script>
```

## Props

| Prop        | 说明          | 类型      | 默认值  |
|-------------|-------------|---------|------|
| dismissible | 是否显示关闭对话框按钮 | boolean | true |

## Slots

| 插槽名      | 说明     |
|----------|--------|
| default  | 标题栏标题  |
| subtitle | 标题栏副标题 |
