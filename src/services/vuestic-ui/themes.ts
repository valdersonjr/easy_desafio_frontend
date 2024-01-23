import { ref, computed } from 'vue'
import { useGlobalConfig } from 'vuestic-ui'

export const THEME_NAMES = {
  LIGHT: 'LIGHT',
}

export const COLOR_THEMES = [
  {
    name: THEME_NAMES.LIGHT,
    colors: {
      primary: '#FF0000',
      secondary: '#1E293B',
      success: '#3d9209',
      info: '#2c82e0',
      danger: '#e42222',
      warning: '#ffd43a',
    },
  },
]

export function useTheme() {
  const themeNameRef = ref(THEME_NAMES.LIGHT)
  const { mergeGlobalConfig } = useGlobalConfig()

  const setTheme = (themeName: keyof typeof THEME_NAMES) => {
    themeNameRef.value = themeName
    const theme = COLOR_THEMES.find((theme) => theme.name === themeName)

    if (!theme) {
      throw new Error('Theme not found')
    }

    mergeGlobalConfig({
      colors: { variables: theme.colors },
    })
  }

  const theme = computed(() => COLOR_THEMES.find((theme) => theme.name === themeNameRef.value))
  return { setTheme, themeName: themeNameRef, theme }
}
