export function durationPartsToMinutes(hours: number, minutes: number): number {
  return hours * 60 + minutes
}

export function toggleRequirement(
  current: string[],
  requirement: string,
  checked: boolean,
): string[] {
  if (checked) {
    return current.includes(requirement) ? current : [...current, requirement]
  }

  return current.filter((item) => item !== requirement)
}
