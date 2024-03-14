<template>
  <div class="flex flex-col gap-3 items-center">
    <UserEdit
      v-if="isUserEditModalOpen"
      :is-open="isUserEditModalOpen"
      :user="userShow"
      @isOpenValueChange="handleIsUserEditModalOpenValueChange"
    />
    <ConfirmationModal
      v-if="isConfirmationModalOpen"
      :is-open="isConfirmationModalOpen"
      :message="t('users.informations.delete.confirmation_modal.title')"
      :ok-text="t('users.informations.delete.confirmation_modal.buttons.confirm')"
      :cancel-text="t('users.informations.delete.confirmation_modal.buttons.deny')"
      :is-loading="isConfirmationModalLoading"
      @isOpenValueChange="handleIsOpenConfirmationModalValueChange"
      @isLoadingValueChange="handleIsLoadingConfirmationModalValueChange"
    />
    <va-card class="w-full pb-4">
      <va-card-title>{{ t('users.informations.filter.title') }}</va-card-title>
      <form class="flex flex-row gap-3 px-3 justify-center items-center" @submit.prevent="onFormSubmit">
        <va-input
          v-model="nameFilter"
          type="text"
          :label="t('users.informations.filter.form.inputs.name')"
          placeholder="Easy Pallet"
        />
        <va-input
          v-model="emailFilter"
          type="text"
          :label="t('users.informations.filter.form.inputs.email')"
          placeholder="easy@pallet.com"
        />
        <va-button class="px-2" color="primary" @click="handleFilterClear">{{
          t('users.informations.filter.form.buttons.clear')
        }}</va-button>
        <va-button type="submit" class="px-2" color="info">{{
          t('users.informations.filter.form.buttons.search')
        }}</va-button>
      </form>
    </va-card>
    <va-card class="w-full">
      <va-card-title>{{ t('users.informations.table.title') }}</va-card-title>
      <va-card-content class="overflow-auto">
        <table class="va-table va-table--striped va-table--hoverable w-full">
          <thead>
            <tr>
              <th @click="handleSorting('name')">
                <sorting-icon-div :text="t('users.informations.table.headers.name')" />
              </th>
              <th @click="handleSorting('email')">
                <sorting-icon-div :text="t('users.informations.table.headers.email')" />
              </th>
              <th>
                <sorting-icon-div :text="t('users.informations.table.headers.profile')" />
              </th>
              <th>
                <sorting-icon-div :text="t('users.informations.table.headers.created_date')" />
              </th>
              <th>{{ t('users.informations.table.headers.update') }}</th>
              <th>{{ t('users.informations.table.headers.delete') }}</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td class="w-[20%]">{{ user.name ? user.name : '-' }}</td>
              <td class="w-[30%]">{{ user.email }}</td>
              <td class="">{{ user.profile.toUpperCase() }}</td>
              <td class="">{{ formatDate(user.created_at) }}</td>
              <td>
                <va-button class="px-2" color="info" icon="edit" plain @click="handleUserUpdate(user.id)" />
              </td>
              <td>
                <va-button class="px-2" color="danger" icon="delete" plain @click="handleUserDeletion(user.id)" />
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
  import usersService from '../../../../services/api/users'
  import { UserDto } from '../../../../dtos/userDto'
  import UserEdit from './user-edit/UserEdit.vue'
  import formatDate from '../../../../services/utils/dateConverter'
  import ConfirmationModal from '../../../../components/modals/ConfirmationModal.vue'
  import { useGlobalStore } from '../../../../stores/global-store'
  import { useToast } from 'vuestic-ui'
  import SortingIconDiv from '../../../../components/sorting-icon-div/SortingIconDiv.vue'

  const { init } = useToast()
  const { t } = useI18n()

  const nameFilter = ref('')
  const emailFilter = ref('')

  const sortColumn = ref('name')
  const sortDirection = ref('asc')
  const isConfirmationModalOpen = ref(false)
  const isUserEditModalOpen = ref(false)
  const isConfirmationModalLoading = ref(false)
  const userShow = ref({} as UserDto)
  const userIdToDelete = ref(-1)

  const users = ref([] as UserDto[])
  const currentPage = ref(1)
  const totalPages = ref(1)

  const GlobalStore = useGlobalStore()

  const fetchUsers = async () => {
    try {
      const response = await usersService.list({
        page: currentPage.value,
        perPage: 10,
        name: nameFilter.value,
        email: emailFilter.value,
        sortColumn: sortColumn.value,
        sortDirection: sortDirection.value,
      })
      users.value = response.data.users
      currentPage.value = response.data.pagination_meta?.current_page || 1
      totalPages.value = response.data.pagination_meta?.total_pages || 1
    } catch (error: any) {
      if (error.response.status === 404) users.value = []
      else {
        console.log('Error fetching users:', error)
        init({ message: t('messages.toast.user.list.error'), color: 'danger' })
      }
      currentPage.value = 1
      totalPages.value = 1
    }
  }

  const handleUserUpdate = (id: number) => {
    if (GlobalStore.user.profile === 'admin') fetchUser(id)
    else
      init({
        message: `${t('messages.toast.profile_permission.error')}: ${GlobalStore.user.profile.toUpperCase()}`,
        color: 'danger',
      })
  }

  const fetchUser = async (id: number) => {
    try {
      const response = await usersService.show(id)
      userShow.value = response.data.user
      isUserEditModalOpen.value = true
    } catch (error) {
      console.log('Error fetching user:', error)
    }
  }

  const handleUserDeletion = (id: number) => {
    if (GlobalStore.user.profile === 'admin') {
      isConfirmationModalOpen.value = true
      userIdToDelete.value = id
    } else
      init({
        message: `${t('messages.toast.profile_permission.error')}: ${GlobalStore.user.profile.toUpperCase()}`,
        color: 'danger',
      })
  }

  const deleteUser = async (id: number) => {
    try {
      const response = await usersService.delete(id)
      console.log(response)
      if (response.status === 200) {
        isConfirmationModalOpen.value = false
        isConfirmationModalLoading.value = false
        fetchUsers()
        init({ message: t('messages.toast.user.delete.success'), color: 'success' })
      }
    } catch (error) {
      console.log('Error deleting user:', error)
      init({ message: t('messages.toast.user.delete.error'), color: 'danger' })
    }
  }

  const onFormSubmit = () => {
    fetchUsers()
  }

  const handleFilterClear = () => {
    nameFilter.value = ''
    emailFilter.value = ''
    fetchUsers()
  }

  const handleSorting = (column: string) => {
    console.log('Sorting:', column)
    if (sortColumn.value === column) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortColumn.value = column
      sortDirection.value = 'asc'
    }
    fetchUsers()
  }

  const handleIsUserEditModalOpenValueChange = (newValue: boolean) => {
    isUserEditModalOpen.value = newValue
    if (!isUserEditModalOpen.value) fetchUsers()
  }

  const handleIsOpenConfirmationModalValueChange = (newValue: boolean) => {
    isConfirmationModalOpen.value = newValue
  }

  const handleIsLoadingConfirmationModalValueChange = (newValue: boolean) => {
    isConfirmationModalLoading.value = newValue
  }

  fetchUsers()
  watch(() => currentPage.value, fetchUsers)
  watch(
    () => isConfirmationModalLoading.value,
    () => {
      if (isConfirmationModalLoading.value) deleteUser(userIdToDelete.value)
    },
  )
</script>
