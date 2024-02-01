<template>
  <div>
    <dashboard-info-block />

    <div class="flex justify-center mt-2">
      <va-button
        class="absolute bottom-2"
        size="small"
        preset="plain"
        target="_blank"
        href="https://easypallet.com.br/"
        title="Easy Pallet"
      >
        Easy Pallet
      </va-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import DashboardInfoBlock from './DashboardInfoBlock.vue'
</script>
