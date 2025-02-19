import Link from 'next/link'
import FeatherIcon from 'feather-icons-react'

export function Nav() {
  const nav = [
    { name: 'Rules', href: '/clash' },
    { name: 'Editor', href: '/clash/editor' },
    { name: 'Config', href: '/clash/config' },
  ]

  return (
    <nav className="w-full p-4 bg-indigo-500 text-white">
      <div className="container-md flex items-center">
        <h1 className="text-xl font-bold">
          <Link href="/">Proxy Rule</Link>
        </h1>

        <div className="ml-8 flex">
          <div className="group inline-flex flex-col relative">
            <span className="absolute left-0 right-0 transition-all opacity-[0] group-hover:opacity-[1] group-hover:translate-y-[-0.8rem] group-hover:scale-[0.6] font-black text-center uppercase user-select-none pointer-events-none">
              Clash
            </span>
            <div className="flex gap-2 transition-all group-hover:translate-y-[0.5rem]">
              {nav.map(({ name, href }, index) => (
                <Link className="relative group/link" href={href} key={index}>
                  {name}
                  <span className="absolute inset-x-0 bottom-0 h-[2px] bg-white transition-all duration-300 transform translate-y-[0.7rem] scale-x-0 group-hover/link:scale-x-100"></span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <a className="ml-auto" href="https://github.com/DavidKk/vercel-proxy-rule" target="_blank" rel="noreferrer">
          <FeatherIcon icon="github" />
        </a>
      </div>
    </nav>
  )
}
