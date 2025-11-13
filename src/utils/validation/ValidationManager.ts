import type { EventForm, EventFormNullable } from '@/utils/validation/forms.types';
import type { EventFormErrors } from '@/utils/validation/forms-errors.types';

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
        } else errors.startDateTime = ""

        if (eventForm.endDateTime === null) {
            isValid = false
            errors.endDateTime = "Дата окончания не может быть пустой"
        } else errors.endDateTime = ""

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

        return { isValid, errors, form: (eventForm as EventForm)  }
    }
}