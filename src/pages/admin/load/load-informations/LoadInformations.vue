<template>
  <div class="flex flex-col gap-3 items-center">
    <LoadEdit
      v-if="isLoadEditModalOpen"
      :is-open="isLoadEditModalOpen"
      :load="loadShow"
      @isOpenValueChange="handleIsLoadEditModalOpenValueChange"
    />
    <ConfirmationModal
      v-if="isConfirmationModalOpen"
      :is-open="isConfirmationModalOpen"
      :message="t('loads.informations.delete.confirmation_modal.title')"
      :ok-text="t('loads.informations.delete.confirmation_modal.buttons.confirm')"
      :cancel-text="t('loads.informations.delete.confirmation_modal.buttons.deny')"
      :is-loading="isConfirmationModalLoading"
      @isOpenValueChange="handleIsOpenConfirmationModalValueChange"
      @isLoadingValueChange="handleIsLoadingConfirmationModalValueChange"
    />
    <va-card class="w-full pb-4">
      <va-card-title>{{ t('loads.informations.filter.title') }}</va-card-title>
      <form class="flex flex-row gap-3 px-3 justify-center items-center" @submit.prevent="onFormSubmit">
        <va-input
          v-model="codeFilter"
          type="text"
          :label="t('loads.informations.filter.form.inputs.code')"
          placeholder="LD1234"
        />
        <VueDatePicker
          v-model="filterDates"
          :enable-time-picker="false"
          range
          format="dd/MM/yy"
          locale="pt-BR"
          class="w-[30%]"
        />
        <va-button class="px-2" color="primary" type="reset" @click="handleFilterClear">{{
          t('loads.informations.filter.form.buttons.clear')
        }}</va-button>
        <va-button type="submit" class="px-2" color="info">{{
          t('loads.informations.filter.form.buttons.search')
        }}</va-button>
      </form>
    </va-card>
    <va-card class="w-full">
      <va-card-title>{{ t('loads.informations.table.title') }}</va-card-title>
      <va-card-content class="overflow-auto">
        <table class="va-table va-table--striped va-table--hoverable w-full">
          <thead>
            <tr>
              <th class="cursor-pointer" @click="handleSorting('code')">
                <div class="flex flex-row gap-1 items-center">
                  {{ t('loads.informations.table.headers.code') }}
                  <va-icon size="3" name="vuestic-iconset-sort-arrow" />
                </div>
              </th>
              <th class="cursor-pointer" @click="handleSorting('delivery_date')">
                <div class="flex flex-row gap-1 items-center">
                  {{ t('loads.informations.table.headers.delivery_date') }}
                  <va-icon size="3" name="vuestic-iconset-sort-arrow" />
                </div>
              </th>
              <th>{{ t('loads.informations.table.headers.update') }}</th>
              <th>{{ t('loads.informations.table.headers.delete') }}</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="load in loads" :key="load.id">
              <td class="w-[30%]">{{ load.code }}</td>
              <td class="">{{ formatDate(load.delivery_date.toString()) }}</td>
              <td>
                <va-button class="px-2" color="info" icon="edit" plain @click="handleLoadUpdate(load.id)" />
              </td>
              <td>
                <va-button class="px-2" color="danger" icon="delete" plain @click="handleLoadDeletion(load.id)" />
              </td>
            </tr>
          </tbody>
        </table>
      </va-card-content>
    </va-card>
    <VaPagination v-model="currentPage" :pages="totalPages" :visible-pages="3" buttons-preset="secondary" />
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import formatDate from '../../../../services/utils/dateConverter'
  import loadsService from '../../../../services/api/loads'
  import { LoadDto } from '../../../../dtos'
  import { useGlobalStore } from '../../../../stores/global-store'
  import LoadEdit from './load-edit/LoadEdit.vue'
  import ConfirmationModal from '../../../../components/modals/ConfirmationModal.vue'
  import VueDatePicker from '@vuepic/vue-datepicker'
  import { useToast } from 'vuestic-ui'

  const { init } = useToast()
  const { t } = useI18n()
  const GlobalStore = useGlobalStore()

  const isConfirmationModalOpen = ref(false)
  const isLoadEditModalOpen = ref(false)
  const isConfirmationModalLoading = ref(false)

  const codeFilter = ref('')
  const filterDates = ref('')

  const loadShow = ref({} as LoadDto)
  const loads = ref([] as LoadDto[])
  const loadIdToDelete = ref(-1)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const sortColumn = ref('code')
  const sortDirection = ref('asc')

  const onFormSubmit = () => {
    fetchLoads()
  }

  const handleFilterClear = () => {
    codeFilter.value = ''
    filterDates.value = ''
    fetchLoads()
  }

  const fetchLoads = async () => {
    try {
      const response = await loadsService.list({
        page: currentPage.value,
        perPage: 10,
        code: codeFilter.value,
        lesserDate: new Date(filterDates.value[0]),
        greaterDate: new Date(filterDates.value[1]),
        sortColumn: sortColumn.value,
        sortDirection: sortDirection.value,
      })
      console.log(response)
      loads.value = response.data.loads
      currentPage.value = response.data.pagination_meta?.current_page || 1
      totalPages.value = response.data.pagination_meta?.total_pages || 1
    } catch (error: any) {
      if (error.response.status === 404) loads.value = []
      currentPage.value = 1
      totalPages.value = 1
    }
  }

  const fetchLoad = async (id: number) => {
    try {
      const response = await loadsService.show(id)
      loadShow.value = response.data.load
      isLoadEditModalOpen.value = true
    } catch (error) {
      console.log('Error fetching user:', error)
    }
  }

  const handleLoadUpdate = (id: number) => {
    if (GlobalStore.user.profile === 'admin') fetchLoad(id)
    else
      init({
        message: `${t('messages.toast.profile_permission.error')}: ${GlobalStore.user.profile.toUpperCase()}`,
        color: 'danger',
      })
  }

  const handleLoadDeletion = (id: number) => {
    if (GlobalStore.user.profile === 'admin') {
      isConfirmationModalOpen.value = true
      loadIdToDelete.value = id
    } else
      init({
        message: `${t('messages.toast.profile_permission.error')}: ${GlobalStore.user.profile.toUpperCase()}`,
        color: 'danger',
      })
  }

  const deleteLoad = async (id: number) => {
    try {
      const response = await loadsService.delete(id)
      console.log(response)
      if (response.status === 200) {
        isConfirmationModalOpen.value = false
        isConfirmationModalLoading.value = false
        fetchLoads()
        init({ message: t('messages.toast.load.delete.success'), color: 'success' })
      }
    } catch (error) {
      console.log('Error deleting user:', error)
      init({ message: t('messages.toast.load.delete.error'), color: 'danger' })
    }
  }

  const handleIsLoadEditModalOpenValueChange = (newValue: boolean) => {
    isLoadEditModalOpen.value = newValue
    if (!isLoadEditModalOpen.value) fetchLoads()
  }

  const handleIsOpenConfirmationModalValueChange = (newValue: boolean) => {
    isConfirmationModalOpen.value = newValue
  }

  const handleIsLoadingConfirmationModalValueChange = (newValue: boolean) => {
    isConfirmationModalLoading.value = newValue
  }

  const handleSorting = (column: string) => {
    if (sortColumn.value === column) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortColumn.value = column
      sortDirection.value = 'asc'
    }
    fetchLoads()
  }

  fetchLoads()
  watch(() => currentPage.value, fetchLoads)
  watch(
    () => isConfirmationModalLoading.value,
    () => {
      if (isConfirmationModalLoading.value) deleteLoad(loadIdToDelete.value)
    },
  )
</script>
