import type { FC, PropsWithChildren } from "react"

import { BODY_COPY, EYEBROW, SECTION_TITLE } from "../styles.ts"

type SectionHeadingProps = PropsWithChildren<{
  eyebrowText: string
  title: string
}>

export const SectionHeading: FC<SectionHeadingProps> = ({
  children,
  eyebrowText,
  title,
}) => (
  <div className="max-w-[740px]">
    <p className={EYEBROW}>{eyebrowText}</p>
    <h2 className={SECTION_TITLE}>{title}</h2>
    {children ? (
      <div className={`mt-[18px] ${BODY_COPY}`}>{children}</div>
    ) : null}
  </div>
)
