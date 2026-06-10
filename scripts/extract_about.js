import fs from 'fs'
const html = fs.readFileSync('tmp_about_page.html', 'utf8')
const id = 'post-body-4113762140761326989'
const start = html.indexOf(`id='${id}'`) // find id
if (start === -1) {
  console.error('post body id not found')
  process.exit(1)
}
const divStart = html.indexOf('>', start)
let i = divStart + 1
let depth = 1
let content = ''
while (i < html.length && depth > 0) {
  const nextOpen = html.indexOf('<', i)
  if (nextOpen === -1) break
  // capture text between tags
  const text = html.substring(i, nextOpen)
  content += text
  const tagEnd = html.indexOf('>', nextOpen)
  if (tagEnd === -1) break
  const tag = html.substring(nextOpen + 1, tagEnd).trim()
  if (tag.startsWith('/')) {
    const tagName = tag.slice(1).split(/\s+/)[0]
    if (
      tagName === 'div' ||
      tagName === 'p' ||
      tagName === 'ul' ||
      tagName === 'ol' ||
      tagName === 'li'
    ) {
      content += '\n'
    }
    depth--
  } else {
    const tagName = tag.split(/\s+/)[0]
    if (tagName === 'br' || tagName === 'br/') content += '\n'
    if (tagName === 'li') content += '\n- '
    if (!tag.endsWith('/')) depth++
  }
  i = tagEnd + 1
}
// decode numeric entities
content = content.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
content = content.replace(/&nbsp;/g, ' ')
content = content.replace(/&amp;/g, '&')
content = content.replace(/&lt;/g, '<')
content = content.replace(/&gt;/g, '>')
content = content.replace(/&quot;/g, '"')
content = content.replace(/\s+\n/g, '\n')
content = content.replace(/\n{3,}/g, '\n\n')
content = content.trim()
fs.writeFileSync('tmp_about_text.md', content, 'utf8')
console.log('extracted to tmp_about_text.md')
