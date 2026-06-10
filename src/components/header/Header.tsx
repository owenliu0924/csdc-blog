import { BluredBackground } from './BluredBackground'
import { HeaderContent } from './HeaderContent'
import { SearchButton } from './SearchButton'
import { AnimatedLogo } from './AnimatedLogo'
import { HeaderMeta } from './HeaderMeta'
import { HeaderDrawer } from './HeaderDrawer'

export function Header() {
  return (
    <header className="fixed top-0 inset-x-0 h-[64px] z-10 overflow-hidden">
      <BluredBackground />
      <div className="max-w-[1100px] h-full md:px-4 mx-auto grid grid-cols-[64px_auto_64px]">
        <div className="flex items-center justify-center">
          <div className="md:hidden flex items-center justify-center">
            <HeaderDrawer />
          </div>
          <div className="hidden md:flex items-center justify-center">
            <AnimatedLogo />
          </div>
        </div>
        <div className="relative flex items-center justify-center">
          <div className="md:hidden flex items-center justify-center">
            <AnimatedLogo fadeOnScroll />
          </div>
          <div className="hidden md:flex items-center justify-center w-full">
            <HeaderContent />
          </div>
          <HeaderMeta />
        </div>
        <div className="flex items-center justify-center">
          <SearchButton />
        </div>
      </div>
    </header>
  )
}
