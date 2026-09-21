export const AtlasBackground = ({ id }: { id: string }) => (
  <>
    <defs>
      <pattern
        id={`${id}-land`}
        width="5"
        height="5"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="2" cy="2" r="1.05" fill="currentColor" />
      </pattern>
      <clipPath id={`${id}-clip`}>
        <rect width="1000" height="440" rx="2" />
      </clipPath>
      <mask
        id={`${id}-shape`}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="1000"
        height="440"
      >
        <image href="/guide-assets/world-land.svg" width="1000" height="440" />
      </mask>
    </defs>
    <g className="atlas-graticule" stroke="currentColor" strokeWidth="0.65">
      {Array.from({ length: 13 }, (_, i) => (
        <path key={`x-${i}`} d={`M${i * 83.33} 0V440`} />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <path key={`y-${i}`} d={`M0 ${i * 73.33}H1000`} />
      ))}
    </g>
    <rect
      className="atlas-land"
      width="1000"
      height="440"
      fill={`url(#${id}-land)`}
      mask={`url(#${id}-shape)`}
    />
  </>
)
