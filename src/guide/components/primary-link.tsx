import type { FC, PropsWithChildren } from "react"

import { FOCUS_LINK } from "../styles.ts"

export const PrimaryLink: FC<PropsWithChildren<{ href: string }>> = ({
  children,
  href,
}) => (
  <a
    className={`${FOCUS_LINK} border-guide-green bg-guide-green hover:border-guide-green-dark hover:bg-guide-green-dark inline-flex min-h-12 items-center justify-center gap-5 border px-[18px] py-3 text-[13px] font-bold text-white no-underline transition-colors`}
    href={href}
  >
    {children}
  </a>
)
