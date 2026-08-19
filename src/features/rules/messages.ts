import type { RuleMessage, RuleMessageKind } from "@/features/itinerary"

export interface RuleMessages {
  violations: RuleMessage[]
  incomplete: RuleMessage[]
  warnings: RuleMessage[]
}

export const createRuleMessages = (): RuleMessages => ({
  violations: [],
  incomplete: [],
  warnings: [],
})

export const addRuleMessage = (
  messages: RuleMessages,
  message: Omit<RuleMessage, "kind"> & { kind: RuleMessageKind }
) => {
  const collection =
    message.kind === "violation"
      ? messages.violations
      : message.kind === "incomplete"
        ? messages.incomplete
        : messages.warnings

  if (!collection.some(({ id }) => id === message.id)) collection.push(message)
}
