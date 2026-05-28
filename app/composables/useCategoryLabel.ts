export const useCategoryLabel = () => {
  const { t, te } = useI18n()

  const getCategoryLabel = (category: string) => {
    const key = `categories.${category}`

    return te(key) ? t(key) : category
  }

  return {
    getCategoryLabel,
  }
}
