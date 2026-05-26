type TaxonomySource = {
  draft?: boolean
  path?: string
  category?: unknown
  tags?: unknown[]
}

export type TaxonomyItem = {
  name: string
  count: number
  children?: TaxonomyItem[]
}

const excludedTaxonomyPaths = new Set(['/about', '/index'])

const sortTaxonomyItems = (items: TaxonomyItem[]) => {
  return items.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

const normalizeTaxonomyName = (value: unknown) => {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)

  return ''
}

export const getCategoryPath = (category: unknown) => {
  if (Array.isArray(category)) {
    return category.map(normalizeTaxonomyName).filter(Boolean).slice(0, 2)
  }

  const normalizedCategory = normalizeTaxonomyName(category)

  return normalizedCategory ? [normalizedCategory] : []
}

export const formatCategoryLabel = (category: unknown) => {
  return getCategoryPath(category).join(' / ')
}

export const buildContentTaxonomies = (docs: TaxonomySource[] = []) => {
  const categoryCounts = new Map<string, number>()
  const childCategoryCounts = new Map<string, Map<string, number>>()
  const tagCounts = new Map<string, number>()

  docs
    .filter(doc => doc.draft !== true && !excludedTaxonomyPaths.has(doc.path ?? ''))
    .forEach((doc) => {
      const [category, childCategory] = getCategoryPath(doc.category)

      if (category) {
        categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1)

        if (childCategory) {
          const childCounts = childCategoryCounts.get(category) ?? new Map<string, number>()
          childCounts.set(childCategory, (childCounts.get(childCategory) ?? 0) + 1)
          childCategoryCounts.set(category, childCounts)
        }
      }

      doc.tags?.forEach((tag) => {
        const normalizedTag = normalizeTaxonomyName(tag)

        if (normalizedTag) {
          tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) ?? 0) + 1)
        }
      })
    })

  return {
    categories: sortTaxonomyItems(Array.from(categoryCounts, ([name, count]) => ({
      name,
      count,
      children: sortTaxonomyItems(Array.from(childCategoryCounts.get(name) ?? [], ([childName, childCount]) => ({
        name: childName,
        count: childCount,
      }))),
    }))),
    tags: sortTaxonomyItems(Array.from(tagCounts, ([name, count]) => ({ name, count }))),
  }
}
