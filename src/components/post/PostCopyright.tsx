import { author, site } from '@/config.json'
import { getFormattedDateTime } from '@/utils/date'
import { AnimatedSignature } from '../AnimatedSignature'
import { useEffect, useState } from 'react'
import { toast } from "react-toastify";

function getPostUrl(slug: string) {
  return new URL(slug, site.url).href
}

export function PostCopyright({
  title,
  slug,
  lastMod,
}: {
  title: string
  slug: string
  lastMod: Date
}) {
  const [lastModStr, setLastModStr] = useState('')
  const url = getPostUrl(slug)

  function handleCopyUrl() {
    navigator.clipboard.writeText(url)
    toast.success('已複製文章鏈接')
  }

  useEffect(() => {
    setLastModStr(getFormattedDateTime(lastMod))
  }, [lastMod])

  return (
    <section className="text-xs leading-loose text-secondary">
      <p>文章標題：{title}</p>
      <p>文章作者：{author.name}</p>
      <p className="break-all">
        <span>文章鏈接：{url}</span>
        <span role="button" className="cursor-pointer select-none ml-1 text-accent hover:underline" onClick={handleCopyUrl}>
          [複製]
        </span>
      </p>
      <p>最後修改時間：{lastModStr}</p>
      <hr className="my-3 border-primary" />
      <div>
        <div className="float-right ml-4 my-2">
          <AnimatedSignature />
        </div>
        <p>
          商業轉載請聯繫站長獲得授權，非商業轉載請註明本文出處及文章鏈接，您可以自由地在任何媒體以任何形式複製和分發作品，也可以修改和創作，但是分發衍生作品時必須採用相同的許可協議。
          <br />
          本文采用
          <a
            className="hover:underline hover:text-accent underline-offset-2"
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh"
            target="_blank"
            rel="noopener noreferrer"
          >
            CC BY-NC-SA 4.0
          </a>
          進行許可。
        </p>
      </div>
    </section>
  )
}
