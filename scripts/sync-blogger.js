#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BLOG_ID = '8333780148292946757'
const BLOGGER_API_URL = `https://www.blogger.com/feeds/${BLOG_ID}/posts/default?alt=json&max-results=20`
const POSTS_DIR = path.join(__dirname, '../src/content/posts')

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = ''
        res.setEncoding('utf8')
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch (e) {
            reject(e)
          }
        })
      })
      .on('error', reject)
  })
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\-\u4E00-\u9FFF]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function htmlToMarkdown(html) {
  if (!html) return ''

  let text = html
    .replace(/<iframe[^>]*src=["']([^"']+)["'][^>]*>[\s\S]*?<\/iframe>/gi, (match, src) => {
      try {
        const url = src.startsWith('//') ? 'https:' + src : src
        const u = new URL(url)
        if (u.hostname.includes('youtube.com') || u.hostname.includes('youtube-nocookie.com')) {
          const m = u.pathname.match(/\/embed\/([^\/\?&]+)/)
          const id = m ? m[1] : u.searchParams.get('v')
          if (id) return `::youtube{#${id}}`
        }
        if (u.hostname.includes('bilibili.com')) {
          const bvid = u.searchParams.get('bvid') || u.searchParams.get('aid')
          if (bvid) return `::bilibili{#${bvid}}`
          return `::bilibili{#${encodeURIComponent(src)}}`
        }
      } catch (e) {
        return ''
      }
      return ''
    })
    .replace(
      /<a[^>]*href=["']([^"']*)["'][^>]*>\s*<img[^>]*src=["']([^"']*)["'][^>]*>\s*<\/a>/gi,
      '![]($1)',
    )
    .replace(
      /<a[^>]*href=["']([^"']*)["'][^>]*>\s*<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*>\s*<\/a>/gi,
      '![$2]($1)',
    )
    .replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, '![$2]($1)')
    .replace(/<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*>/gi, '![$1]($2)')
    .replace(/<img[^>]*src=["']([^"']*)["'][^>]*>/gi, '![]($1)')
    .replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gi, '[$2]($1)')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n\n')
    .replace(/<\/p>/gi, '')
    .replace(/<strong[^>]*>/gi, '**')
    .replace(/<\/strong>/gi, '**')
    .replace(/<b[^>]*>/gi, '**')
    .replace(/<\/b>/gi, '**')
    .replace(/<em[^>]*>/gi, '*')
    .replace(/<\/em>/gi, '*')
    .replace(/<i[^>]*>/gi, '*')
    .replace(/<\/i>/gi, '*')
    .replace(/<h([1-6])[^>]*>/gi, (match, level) => '\n' + '#'.repeat(level) + ' ')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<pre[^>]*>/gi, '```\n')
    .replace(/<\/pre>/gi, '\n```')
    .replace(/<code[^>]*>/gi, '`')
    .replace(/<\/code>/gi, '`')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n\n\n+/g, '\n\n')
    .trim()

  return text
}

function escapeYamlString(str) {
  if (!str) return '""'
  if (/[:\n"\[\]{}#&*!|>'%@`]/.test(str)) {
    const escaped = str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ')
    return `"${escaped}"`
  }
  return str
}

function parseDate(dateString) {
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

async function syncBlogs() {
  try {
    console.log('Fetching latest posts from Blogger...')
    const response = await fetchJSON(BLOGGER_API_URL)

    let entries = []
    if (response.feed && response.feed.entry) {
      entries = response.feed.entry
    }

    const validEntries = entries.filter((entry) => {
      if (!entry.title || !entry.published) return false
      if (entry.app$control && entry.app$control.draft && entry.app$control.draft.$t === 'yes') {
        return false
      }
      return true
    })

    console.log(`Found ${validEntries.length} valid entries to process.`)

    if (!fs.existsSync(POSTS_DIR)) {
      fs.mkdirSync(POSTS_DIR, { recursive: true })
    }

    let createdCount = 0
    let updatedCount = 0
    let skippedCount = 0
    const errors = []

    for (const entry of validEntries) {
      try {
        const title = entry.title.$t || 'Untitled'
        const published = parseDate(entry.published.$t)
        const updated = entry.updated ? parseDate(entry.updated.$t) : published

        let content = ''
        if (entry.content) {
          content = entry.content.$t || ''
        } else if (entry.summary) {
          content = entry.summary.$t || ''
        }

        const body = htmlToMarkdown(content)

        const tags = entry.category
          ? entry.category.map((cat) => cat.term).filter((tag) => tag && !tag.startsWith('http'))
          : []

        const summarySource = body.replace(/::\w+\{[^}]*\}/g, '')
        const summary =
          summarySource
            .replace(/[#*`\[\]()]/g, '')
            .replace(/\n+/g, ' ')
            .substring(0, 200)
            .trim() + '...'

        const slug = slugify(title)
        const filename = `${published}-${slug}.md`.substring(0, 255)
        const filepath = path.join(POSTS_DIR, filename)

        let yamlContent = '---\n'
        yamlContent += `title: ${escapeYamlString(title)}\n`
        yamlContent += `date: ${published}\n`
        yamlContent += `lastMod: ${updated}T00:00:00.000Z\n`
        yamlContent += `summary: ${escapeYamlString(summary)}\n`
        if (tags.length > 0) {
          yamlContent += `category: ${escapeYamlString(tags[0])}\n`
          yamlContent += `tags: [${tags.map((t) => escapeYamlString(t)).join(', ')}]\n`
        }
        yamlContent += '---\n\n'
        yamlContent += body

        if (fs.existsSync(filepath)) {
          const currentContent = fs.readFileSync(filepath, 'utf-8')
          if (currentContent === yamlContent) {
            skippedCount++
            continue
          } else {
            fs.writeFileSync(filepath, yamlContent, 'utf-8')
            console.log(`✓ Updated: ${filename}`)
            updatedCount++
          }
        } else {
          fs.writeFileSync(filepath, yamlContent, 'utf-8')
          console.log(`✓ Created: ${filename}`)
          createdCount++
        }
      } catch (error) {
        errors.push(`Error processing "${entry.title?.$t || 'Unknown'}": ${error.message}`)
      }
    }

    console.log(`\n✓ Sync complete!`)
    console.log(`Created: ${createdCount}, Updated: ${updatedCount}, Skipped: ${skippedCount}`)

    if (errors.length > 0) {
      console.log('\nErrors encountered:')
      errors.forEach((err) => console.log(`  ⚠ ${err}`))
    }
  } catch (error) {
    console.error('Sync failed:', error)
    process.exit(1)
  }
}

syncBlogs()
