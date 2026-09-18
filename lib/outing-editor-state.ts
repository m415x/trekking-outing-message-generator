import type { TrekkingEvent } from "./trekking-event"
import { durationPartsToMinutes } from "./outing-form"

export function updateMeeting(
  current: TrekkingEvent,
  values: {
    date: string
    time: string
    placeName: string
  },
): TrekkingEvent {
  return {
    ...current,
    meeting: {
      ...current.meeting,
      date: values.date,
      time: values.time,
      location: {
        ...current.meeting.location,
        placeName: values.placeName,
      },
    },
  }
}

export function setEstimatedDuration(
  current: TrekkingEvent,
  hours: number,
  minutes: number,
): TrekkingEvent {
  return {
    ...current,
    route: {
      ...current.route,
      estimatedDurationMinutes: durationPartsToMinutes(hours, minutes),
    },
  }
}

export function addCustomRequirement(
  current: TrekkingEvent,
  requirement: string,
): TrekkingEvent {
  const normalized = requirement.trim()

  if (!normalized || current.requirements.includes(normalized)) {
    return current
  }

  return {
    ...current,
    requirements: [...current.requirements, normalized],
  }
}
