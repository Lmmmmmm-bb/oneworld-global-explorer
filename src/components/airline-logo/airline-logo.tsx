import { useState, type ComponentProps, type FC } from "react"

import { cn } from "@/lib/utils"

interface AirlineLogoProps extends Omit<ComponentProps<"span">, "children"> {
  code: string
}

export const AirlineLogo: FC<AirlineLogoProps> = ({
  code,
  className,
  ...props
}) => {
  const normalizedCode = code.toUpperCase()
  const [failedCode, setFailedCode] = useState<string | null>(null)
  const imageFailed = failedCode === normalizedCode

  return (
    <span
      {...props}
      aria-hidden="true"
      className={cn(
        "relative grid size-5 shrink-0 place-items-center overflow-hidden rounded-sm bg-background text-[8px] font-bold text-muted-foreground ring-1 ring-border/70",
        className
      )}
    >
      <span>{normalizedCode.slice(0, 2)}</span>
      {!imageFailed ? (
        <img
          alt=""
          className="absolute inset-0 size-full bg-background object-contain p-0.5"
          decoding="async"
          loading="lazy"
          onError={() => setFailedCode(normalizedCode)}
          src={`${import.meta.env.BASE_URL}airlines/${normalizedCode}.png`}
        />
      ) : null}
    </span>
  )
}
