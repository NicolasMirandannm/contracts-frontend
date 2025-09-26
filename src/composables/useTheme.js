import { useTheme } from 'vuetify'

export function useAppTheme() {
  const theme = useTheme()

  const toggleTheme = () => {
    theme.global.name.value =
      theme.global.current.value.dark ? 'light' : 'dark'
  }

  const setTheme = (mode) => {
    theme.global.name.value = mode
  }

  return { theme, toggleTheme, setTheme }
}
