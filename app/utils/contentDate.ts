export const formatContentDate = (value?: Date | string | null, locale = 'zh-CN') => {
  if (!value) {
    return ''
  }

  const date = value instanceof Date
    ? value
    : new Date(String(value).includes('T') ? String(value) : `${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}
