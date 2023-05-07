如果对话框只是用来展示一简单的些信息, 则可以配合该组件使用

## 示例

```vue
<template>
  <Container #default="{ status, changeStatus }">
    <Dialog :model-value="status" @update:model-value="changeStatus">...</Dialog>
  </Container>
</template>

<script setup>
import { Container, Dialog } from '@tomoeed/vue-dialog';
</script>
```

## Props

| Prop        | 说明        | 类型      | 默认值   |
|-------------|-----------|---------|-------|
| defaultOpen | 对话框默认是否打开 | boolean | false |
