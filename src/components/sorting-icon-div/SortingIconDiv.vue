<template>
  <div class="flex flex-row gap-1 items-center">
    <span class="select-none">{{ props.text }}</span>
    <va-icon size="3" name="vuestic-iconset-sort-arrow" />
  </div>
</template>

<script setup lang="ts">
  import { defineProps } from 'vue'
  const props = defineProps(['text'])
</script>
