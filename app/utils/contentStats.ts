type ContentNode = {
  type?: string
  value?: unknown
  children?: ContentNode[]
  props?: Record<string, unknown>
}

const READING_WORDS_PER_MINUTE = 200

export type ContentStats = {
  wordCount: number
  readingMinutes: number
}

const extractText = (node: unknown): string => {
  if (typeof node === 'string') {
    return node
  }

  if (Array.isArray(node)) {
    return node.map(extractText).join(' ')
  }

  if (!node || typeof node !== 'object') {
    return ''
  }

  const contentNode = node as ContentNode
  const ownText = typeof contentNode.value === 'string' ? contentNode.value : ''
  const minimarkText = Array.isArray(contentNode.value)
    ? contentNode.value.map(extractText).join(' ')
    : ''
  const childText = Array.isArray(contentNode.children)
    ? contentNode.children.map(extractText).join(' ')
    : ''

  return [ownText, minimarkText, childText].filter(Boolean).join(' ')
}

export const getContentStats = (body?: unknown): ContentStats => {
  const text = extractText(body)
  const cjkCount = text.match(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g)?.length ?? 0
  const latinWordCount = text
    .replace(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g, ' ')
    .match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g)?.length ?? 0
  const wordCount = cjkCount + latinWordCount

  return {
    wordCount,
    readingMinutes: Math.max(1, Math.ceil(wordCount / READING_WORDS_PER_MINUTE)),
  }
}
