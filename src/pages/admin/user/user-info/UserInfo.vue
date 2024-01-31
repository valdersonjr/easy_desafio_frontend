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
      :message="'Are you sure?'"
      :ok-text="'Yes'"
      :cancel-text="'Cancel'"
      :is-loading="isConfirmationModalLoading"
      @isOpenValueChange="handleIsOpenConfirmationModalValueChange"
      @isLoadingValueChange="handleIsLoadingConfirmationModalValueChange"
    />
    <va-card class="w-full pb-4">
      <va-card-title>Filters</va-card-title>
      <form class="flex flex-row gap-3 px-3 justify-center items-center" @submit.prevent="onFormSubmit">
        <va-input v-model="nameFilter" type="text" :label="'Name'" placeholder="Easy Pallet" />
        <va-input v-model="emailFilter" type="email" :label="'Email'" placeholder="easy@pallet.com" />
        <va-button type="submit" class="px-2" color="info">Submit</va-button>
      </form>
    </va-card>
    <va-card class="w-full">
      <va-card-title>{{ t('users.informations.table') }}</va-card-title>
      <va-card-content class="overflow-auto">
        <table class="va-table va-table--striped va-table--hoverable w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Profile</th>
              <th>Created Date</th>
              <th>Update</th>
              <th>Delete</th>
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

  const { t } = useI18n()

  const nameFilter = ref('')
  const emailFilter = ref('')

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
      })
      users.value = response.data.data
      currentPage.value = response.data.meta?.current_page || 1
      totalPages.value = response.data.meta?.total_pages || 1
    } catch (error: any) {
      if (error.response.status === 404) users.value = []
    }
  }

  const handleUserUpdate = (id: number) => {
    if (GlobalStore.user.profile === 'admin') fetchUser(id)
    else alert(`${GlobalStore.user.profile.toUpperCase()} profile are not allowed to alter other users`)
  }

  const fetchUser = async (id: number) => {
    try {
      const response = await usersService.show(id)
      userShow.value = response.data.data
      isUserEditModalOpen.value = true
    } catch (error) {
      console.log('Error fetching user:', error)
    }
  }

  const handleUserDeletion = (id: number) => {
    if (GlobalStore.user.profile === 'admin') {
      isConfirmationModalOpen.value = true
      userIdToDelete.value = id
    } else alert(`${GlobalStore.user.profile.toUpperCase()} profile are not allowed to alter other users`)
  }

  const deleteUser = async (id: number) => {
    try {
      const response = await usersService.delete(id)
      console.log(response)
      if (response.status === 200) {
        isConfirmationModalOpen.value = false
        isConfirmationModalLoading.value = false
        fetchUsers()
      }
    } catch (error) {
      console.log('Error deleting user:', error)
    }
  }

  const onFormSubmit = () => {
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
