<template>
  <div class="dashboard">
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

<style lang="scss">
  .dashboard {
    .va-card {
      margin-bottom: 0 !important;
      &__title {
        display: flex;
        justify-content: space-between;
      }
    }
  }
</style>
