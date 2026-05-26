import { createWriteStream } from 'node:fs'
import { access, mkdir, rename, rm } from 'node:fs/promises'
import { get as httpGet } from 'node:http'
import { get as httpsGet } from 'node:https'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import bookmarks from '../app/data/bookmarks.json' with { type: 'json' }

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')
const outputDir = join(projectRoot, 'public', 'img', 'bookmarks', 'favicons')
const shouldForce = process.argv.includes('--force')
const requestTimeout = 2000

const requestHeaders = {
  Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
  'User-Agent': 'Mozilla/5.0 bookmark-favicon-downloader',
}

const downloadFile = async (url, outputPath) => {
  await new Promise((resolve, reject) => {
    const request = (url.startsWith('https:') ? httpsGet : httpGet)(url, {
      headers: requestHeaders,
      timeout: requestTimeout,
    }, (response) => {
      if (
        response.statusCode
        && response.statusCode >= 300
        && response.statusCode < 400
        && response.headers.location
      ) {
        response.resume()
        downloadFile(new URL(response.headers.location, url).toString(), outputPath)
          .then(resolve)
          .catch(reject)
        return
      }

      if (response.statusCode !== 200) {
        response.resume()
        reject(new Error(`Request failed with ${response.statusCode}`))
        return
      }

      const fileStream = createWriteStream(outputPath)
      response.pipe(fileStream)
      fileStream.on('finish', () => {
        fileStream.close(resolve)
      })
      fileStream.on('error', reject)
    })

    request.on('timeout', () => {
      request.destroy(new Error('Request timed out'))
    })
    request.on('error', reject)
  })
}

const fetchText = async (url) => {
  return await new Promise((resolve, reject) => {
    const request = (url.startsWith('https:') ? httpsGet : httpGet)(url, {
      headers: requestHeaders,
      timeout: requestTimeout,
    }, (response) => {
      if (
        response.statusCode
        && response.statusCode >= 300
        && response.statusCode < 400
        && response.headers.location
      ) {
        response.resume()
        fetchText(new URL(response.headers.location, url).toString())
          .then(resolve)
          .catch(reject)
        return
      }

      if (response.statusCode !== 200) {
        response.resume()
        reject(new Error(`Request failed with ${response.statusCode}`))
        return
      }

      response.setEncoding('utf8')
      let body = ''
      response.on('data', (chunk) => {
        body += chunk
      })
      response.on('end', () => resolve(body))
    })

    request.on('timeout', () => {
      request.destroy(new Error('Request timed out'))
    })
    request.on('error', reject)
  })
}

const pageIconUrls = async (hostname) => {
  try {
    const pageUrl = `https://${hostname}/`
    const html = await fetchText(pageUrl)
    const links = Array.from(html.matchAll(/<link\b[^>]*>/gi))

    return links
      .map(([tag]) => {
        const rel = tag.match(/\brel=["']?([^"'\s>]+(?:\s+[^"'\s>]+)*)/i)?.[1]
        const href = tag.match(/\bhref=["']?([^"'\s>]+)/i)?.[1]

        if (!rel || !href || !/\b(?:icon|shortcut icon|apple-touch-icon)\b/i.test(rel)) {
          return undefined
        }

        return new URL(href, pageUrl).toString()
      })
      .filter(Boolean)
  }
  catch {
    return []
  }
}

const faviconUrls = async (hostname) => {
  const urls = [
    ...(await pageIconUrls(hostname)),
    `https://${hostname}/favicon.ico`,
    `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
    `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
  ]

  return Array.from(new Set(urls))
}

const fileExists = async (path) => {
  try {
    await access(path)
    return true
  }
  catch {
    return false
  }
}

await mkdir(outputDir, { recursive: true })

const uniqueHostnames = Array.from(new Set(bookmarks
  .filter(bookmark => bookmark.image !== false && !bookmark.image)
  .map((bookmark) => {
    return new URL(bookmark.url).hostname
  }))).sort()

for (const hostname of uniqueHostnames) {
  const outputPath = join(outputDir, `${hostname}.ico`)
  const temporaryPath = `${outputPath}.tmp`

  if (!shouldForce && await fileExists(outputPath)) {
    console.log(`Skipped ${hostname}`)
    continue
  }

  try {
    let lastError

    for (const url of await faviconUrls(hostname)) {
      try {
        await rm(temporaryPath, { force: true })
        await downloadFile(url, temporaryPath)
        await rename(temporaryPath, outputPath)
        lastError = undefined
        break
      }
      catch (error) {
        lastError = error
      }
    }

    if (lastError) {
      throw lastError
    }

    console.log(`Downloaded ${hostname}`)
  }
  catch (error) {
    await rm(temporaryPath, { force: true })
    console.warn(`Failed ${hostname}: ${error.message}`)
  }
}
