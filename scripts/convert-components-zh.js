import fs from 'fs/promises'
import path from 'path'
import { execSync } from 'child_process'

const root = process.cwd()

const exts = new Set([
  '.md',
  '.markdown',
  '.astro',
  '.html',
  '.htm',
  '.txt',
  '.json',
  '.ts',
  '.tsx',
])

function isIgnored(filePath) {
  return (
    filePath.includes('node_modules') ||
    filePath.includes('.git') ||
    filePath.includes('public/fonts')
  )
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (isIgnored(full)) continue
    if (e.isDirectory()) {
      files.push(...(await walk(full)))
    } else if (exts.has(path.extname(e.name).toLowerCase())) {
      files.push(full)
    }
  }
  return files
}

async function convertFile(file) {
  const tmpOut = `${file}.opencc.tmp`
  const bak = `${file}.bak`
  try {
    try {
      await fs.stat(bak)
    } catch {
      await fs.copyFile(file, bak)
    }
    execSync(`npx opencc -c s2t.json -i "${file}" -o "${tmpOut}"`, { stdio: 'inherit' })
    const converted = await fs.readFile(tmpOut, 'utf8')
    const orig = await fs.readFile(file, 'utf8')
    if (converted !== orig) {
      await fs.writeFile(file, converted, 'utf8')
      console.log('Converted:', file)
    } else {
      console.log('No changes:', file)
    }
  } catch (err) {
    console.error('Failed to convert', file, err && err.message)
  } finally {
    try {
      await fs.unlink(tmpOut)
    } catch (e) {}
  }
}

;(async function main() {
  const componentsDir = path.join(root, 'src', 'components')
  try {
    const stat = await fs.stat(componentsDir)
    if (!stat.isDirectory()) {
      console.error('src/components is not a directory')
      process.exit(1)
    }
  } catch (e) {
    console.error('src/components not found')
    process.exit(1)
  }
  const files = await walk(componentsDir)
  for (const f of files) await convertFile(f)
  console.log('Components conversion complete. Review changes with git.')
})()
