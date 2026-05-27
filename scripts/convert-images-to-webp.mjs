import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import sharp from 'sharp'

const imageExtensions = new Set(['.avif', '.jpeg', '.jpg', '.png', '.tiff', '.webp'])
const options = {
  deleteOriginal: false,
  force: false,
  quality: 82,
}

const inputs = []

for (const arg of process.argv.slice(2)) {
  if (arg === '--delete-original') {
    options.deleteOriginal = true
    continue
  }

  if (arg === '--force') {
    options.force = true
    continue
  }

  if (arg.startsWith('--quality=')) {
    const quality = Number(arg.slice('--quality='.length))

    if (Number.isInteger(quality) && quality >= 1 && quality <= 100) {
      options.quality = quality
      continue
    }

    throw new Error('--quality must be an integer from 1 to 100')
  }

  inputs.push(arg)
}

const targetInputs = inputs.length ? inputs : ['public/img']

const fileExists = async (filePath) => {
  try {
    await stat(filePath)
    return true
  } catch {
    return false
  }
}

const collectImageFiles = async (inputPath) => {
  const stats = await stat(inputPath)

  if (stats.isFile()) {
    return imageExtensions.has(path.extname(inputPath).toLowerCase()) ? [inputPath] : []
  }

  if (!stats.isDirectory()) return []

  const entries = await readdir(inputPath, { withFileTypes: true })
  const nestedFiles = await Promise.all(entries.map((entry) => {
    return collectImageFiles(path.join(inputPath, entry.name))
  }))

  return nestedFiles.flat()
}

const convertImage = async (inputPath) => {
  const extension = path.extname(inputPath).toLowerCase()
  const outputPath = inputPath.replace(new RegExp(`${extension}$`, 'i'), '.webp')

  if (extension === '.webp' && !options.force) {
    return { inputPath, outputPath, status: 'skipped-webp' }
  }

  if (!options.force && await fileExists(outputPath)) {
    return { inputPath, outputPath, status: 'skipped-existing' }
  }

  await sharp(inputPath)
    .rotate()
    .webp({ quality: options.quality })
    .toFile(outputPath)

  if (options.deleteOriginal && inputPath !== outputPath) {
    await import('node:fs/promises').then(({ unlink }) => unlink(inputPath))
  }

  return { inputPath, outputPath, status: 'converted' }
}

const main = async () => {
  const files = (await Promise.all(targetInputs.map(collectImageFiles))).flat()

  if (!files.length) {
    console.log('No images found.')
    return
  }

  const results = []

  for (const file of files) {
    results.push(await convertImage(file))
  }

  for (const result of results) {
    if (result.status === 'converted') {
      console.log(`converted ${result.inputPath} -> ${result.outputPath}`)
    } else if (result.status === 'skipped-existing') {
      console.log(`skipped existing ${result.outputPath}`)
    } else if (result.status === 'skipped-webp') {
      console.log(`skipped webp ${result.inputPath}`)
    }
  }

  const convertedCount = results.filter(result => result.status === 'converted').length
  console.log(`Done. Converted ${convertedCount}/${results.length} image(s).`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
