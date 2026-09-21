import type { FC } from "react"
import { ArrowUpRight } from "lucide-react"

import { SectionHeading } from "../components/section-heading.tsx"
import { FOCUS_LINK, PAGE_WIDTH } from "../styles.ts"

const EXAMPLE_ROUTE_URL =
  "https://oneworld-explorer.lmmmmmm.dev/#/share/v1/eJy1kUFLw0AQhf_LnOOh6ik3GymlFItWFBEPYzJJhm52l901WkL-u5MNWCkt5NLjzLw37xumgxbSWQI71gWkwIE1OXR7SKDAgJB24POaGnwh59noKM7xk3Wm0HuxUG60aQZDw4qwojnGVfgVjDRJF68c6o0lvcJvSEtUnhIoFVd1EP97BzzI6Qcbq-hqJp7SmUZa28VGCtmSwnr5NASg25EQVhk6x-RkML-TPvvMFORrdPQXYKzccUI7VC2q570VLfhgrGll2idHHNcHjjE8ciwf7k9zrNbTOaJ2KsfNgWMMjxzbtzMcj4vpHFE7leP2319i-MgRX3RJjo--_wVCe97h"

export const ExampleRoute: FC = () => (
  <section
    className={`${PAGE_WIDTH} grid items-center gap-11 py-[72px] min-[1041px]:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] min-[1041px]:gap-[50px] sm:py-[104px]`}
    id="example"
  >
    <div>
      <SectionHeading
        eyebrowText="A ROUTE YOU CAN OPEN"
        title="San Francisco · London · Tokyo · Sydney · San Francisco"
      >
        <p>
          This four-flight example passes the planner&apos;s checked-in route
          and implemented rule checks at an estimated 23,596 miles. Open the
          snapshot to inspect the map, mileage, and validation details.
        </p>
        <a
          className={`${FOCUS_LINK} border-guide-green text-guide-green-dark mt-3 inline-flex items-center gap-2 border-b pb-1.5 text-[13px] font-bold no-underline`}
          href={EXAMPLE_ROUTE_URL}
        >
          Explore the read-only itinerary
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </a>
      </SectionHeading>
    </div>
    <div>
      <figure className="border-guide-line m-0 overflow-hidden border bg-white shadow-[0_16px_45px_rgba(32,63,45,0.07)]">
        <img
          alt="Global Explorer Planner showing the four-flight sample, mileage summary, and route validation"
          className="block h-auto w-full"
          height="720"
          loading="lazy"
          src="/planner-example.png"
          width="1280"
        />
        <figcaption className="border-guide-line text-guide-muted border-t px-[18px] py-3.5 text-[11px]">
          A planning example, not a fare quote or a confirmed booking.
        </figcaption>
      </figure>
    </div>
  </section>
)
