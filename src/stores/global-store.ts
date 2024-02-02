import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { UserDto } from '../dtos'
import authService from '../services/api/auth'

export const useGlobalStore = defineStore('global', () => {
  const isSidebarMinimized = ref(false)
  const userName = ref('Pão de Queijo')

  const token = ref(localStorage.getItem('token'))
  const user = ref(JSON.parse(localStorage.getItem('user') as string))

  function toggleSidebar() {
    isSidebarMinimized.value = !isSidebarMinimized.value
  }

  function setToken(tokenValue: string) {
    localStorage.setItem('token', tokenValue)
    token.value = tokenValue
  }

  function setUser(userValue: UserDto) {
    userValue.profile = userValue.profile.toLocaleLowerCase()
    localStorage.setItem('user', JSON.stringify(userValue))
    user.value = userValue
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    token.value = null
    user.value = null
  }

  async function checkToken() {
    try {
      const tokenAuth = token.value

      const response = await authService.validateSession(tokenAuth!)

      if (response.status == 200) {
        return true
      } else {
        return false
      }
    } catch (error) {
      console.log(error)
      return false
    }
  }

  return {
    isSidebarMinimized,
    userName,
    toggleSidebar,
    setToken,
    setUser,
    checkToken,
    logout,
    user,
  }
})
