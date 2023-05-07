## 示例

```vue
<template>
<Dialog v-model="status">
  <Body as="form">...</Body>
</Dialog>
</template>

<script setup>
import { ref } from 'vue';
import { Dialog, Body } from '@tomoeed/vue-dialog';

const status = ref(false);
</script>
```

## Props

| Prop | 说明                                       | 类型     | 默认值 |
|------|------------------------------------------|--------|-----|
| as   | 如果你想要将该组件渲染为非 `div` 标签, 则指定该参数 (如: form) | string | div |
