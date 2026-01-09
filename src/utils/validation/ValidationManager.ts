import type { EventForm, EventFormNullable } from '@/utils/validation/forms.types';
import type { EventFormErrors } from '@/utils/validation/forms-errors.types';
import { FormatManager } from '@/utils/FormatManager.ts';

export const ValidationManager = {
    validateEventForm(eventForm: EventFormNullable) {
        const errors = {} as EventFormErrors
        let isValid = true

        if (eventForm.name === "") {
            isValid = false
            errors.name = "Имя не может быть пустым"
        } else errors.name = ""

        if (eventForm.shortDescription === "") {
            isValid = false
            errors.shortDescription = "Краткое описание не может быть пустым"
        } else errors.shortDescription = ""

        if (eventForm.startDateTime === null) {
            isValid = false
            errors.startDateTime = "Дата начала не может быть пустой"
        } else {
            errors.startDateTime = ""
        }

        if (eventForm.eventType === null) {
            isValid = false
            errors.eventType = "Тип события не может быть пустым"
        } else errors.eventType = ""

        if (eventForm.eventFormat === null) {
            isValid = false
            errors.eventFormat = "Формат события не может быть пустым"
        } else errors.eventFormat = ""

        if (eventForm.competence === null) {
            isValid = false
            errors.competence = "Компетенция должна быть указана"
        } else errors.competence = ""

        if (eventForm.ageCategory === null) {
            isValid = false
            errors.ageCategory = "Возрастная группа должна быть указана"
        } else errors.ageCategory = ""

        if (eventForm.eventVenue === null) {
          isValid = false
          errors.eventVenue = "Место проведения должно быть указано"
        } else errors.eventVenue = ""

        return {
            isValid,
            errors,
            form: {
                ...eventForm,
                startDateTime: eventForm.startDateTime !== null
                  ? FormatManager.formatDateToDTO(eventForm.startDateTime)
                  : eventForm.startDateTime,
                endDateTime: eventForm.endDateTime !== null
                  ? FormatManager.formatDateToDTO(eventForm.endDateTime)
                  : eventForm.endDateTime,
            } as EventForm
        }
    }
}