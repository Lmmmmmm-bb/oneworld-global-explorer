import type { PropsWithChildren } from "react"

export const PrimaryLink = ({
  children,
  href,
  light = false,
}: PropsWithChildren<{ href: string; light?: boolean }>) => (
  <a
    className={`guide-primary-link ${light ? "guide-primary-link-light" : ""}`}
    href={href}
  >
    {children}
  </a>
)
