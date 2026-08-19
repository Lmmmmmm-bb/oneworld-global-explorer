import { CARRIERS, OPERATING_CARRIERS } from "./config"

export const getMarketingCarrierOptions = (eligibleCodes: string[]) =>
  CARRIERS.filter(({ code }) => eligibleCodes.includes(code)).sort(
    (left, right) =>
      (left.kind === right.kind ? 0 : left.kind === "member" ? -1 : 1) ||
      left.name.localeCompare(right.name)
  )

export const getOperatingCarrierOptions = (marketingCarrier: string) =>
  OPERATING_CARRIERS.filter(
    ({ marketingCarriers }) =>
      marketingCarriers === "all" ||
      marketingCarriers.includes(marketingCarrier)
  )
