export enum EventTypes {
  QUALIFIERS = "Отборочный этап",
  FINAL = "Финальный этап",
}

export enum EventFormats {
  OFFLINE = "Оффлайн",
  ONLINE = "Онлайн"
}

export enum SortFields {
  NAME = "name",
  SHORT_DESCRIPTION = "shortDescription",
}

export enum EventVerifications {
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  UNCHECKED = "UNCHECKED",
}

export const eventTypeOptions = Object.entries(EventTypes).map(
  ([key, value]) => ({
    label: value,
    value: key
  })
)

export const eventFormatOptions = Object.entries(EventFormats).map(
  ([key, value]) => ({
    label: value,
    value: key
  })
)