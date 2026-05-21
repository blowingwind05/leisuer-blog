type TaxonomySource = {
  draft?: boolean
  path?: string
  category?: string
  tags?: string[]
}

export type TaxonomyItem = {
  name: string
  count: number
}

const excludedTaxonomyPaths = new Set(['/about', '/index'])

const sortTaxonomyItems = (items: TaxonomyItem[]) => {
  return items.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

export const buildContentTaxonomies = (docs: TaxonomySource[] = []) => {
  const categoryCounts = new Map<string, number>()
  const tagCounts = new Map<string, number>()

  docs
    .filter(doc => doc.draft !== true && !excludedTaxonomyPaths.has(doc.path ?? ''))
    .forEach((doc) => {
      if (doc.category) {
        categoryCounts.set(doc.category, (categoryCounts.get(doc.category) ?? 0) + 1)
      }

      doc.tags?.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
      })
    })

  return {
    categories: sortTaxonomyItems(Array.from(categoryCounts, ([name, count]) => ({ name, count }))),
    tags: sortTaxonomyItems(Array.from(tagCounts, ([name, count]) => ({ name, count }))),
  }
}
