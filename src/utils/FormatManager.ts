import { useAgeGroups } from '@/shared/UseAgeGroups.ts';
import { useGradeOptions } from '@/shared/UseGradeOptions.ts';

import { AgeCategories } from '@/api/resolvers/ageCategory/dto/types.d';

export const FormatManager = {
  ageGroups: useAgeGroups,
  gradeOptions: useGradeOptions,

  formatBirthDateFromDTO(birthDate: string) {
    const parts = birthDate.substring(0, 10).split("-");
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  },
  formatBirthDateToDTO(birthDate: string) {
    const [day, month, year] = birthDate.split('.').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return date.toISOString();
  },
  formatSnilsFromDTO(snils: string) {
    return `${snils.substring(0, 3)}-${snils.substring(3, 6)}-${snils.substring(6, 9)} ${snils.substring(9, 11)}`;
  },
  formatSnilsToDTO(number: string) {
    return [
      number.substring(0, 3),
      number.substring(4, 7),
      number.substring(8, 11),
      number.substring(12, 14)
    ].join('')
  },
  formatMobileNumberFromDTO(number: string) {
    return `${number.substring(0, 2)} (${number.substring(2, 5)}) ${number.substring(5, 8)} ${number.substring(8, 10)}-${number.substring(10, 12)}`;
  },
  formatMobileNumberToDTO(number: string) {
    return number.replaceAll(/\s|-|\(|\)/g, "");
  },
  formatDateToDTO(date: Date, offsetMinutes: number = 180) {
    console.log(date)
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const absOffset = Math.abs(offsetMinutes);
    const offsetHours = Math.floor(absOffset / 60).toString().padStart(2, '0');
    const offsetMins = (absOffset % 60).toString().padStart(2, '0');

    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const hh = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    const ss = date.getSeconds().toString().padStart(2, '0');

    return `${yyyy.toString()}-${mm}-${dd}T${hh}:${min}:${ss}${sign}${offsetHours}:${offsetMins}`;
  },
  formatDateFromDTO(dtoDate: string) {
    const date = new Date(dtoDate);

    const dd = date.getDate().toString().padStart(2, '0');
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = date.getFullYear();

    const hh = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    const ss = date.getSeconds().toString().padStart(2, '0');

    return `${dd}.${mm}.${yyyy.toString()} ${hh}:${min}:${ss}`;
  },
  calculateAge(birthDate: string) {
    const birth = new Date(birthDate.substring(0, 10));
    const onDate = new Date(2026, 1, 14)

    let age = onDate.getFullYear() - birth.getFullYear();
    const monthDiff = onDate.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && onDate.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  },
  getAgeGroupLabel(ageCategory: AgeCategories | undefined) {
    return this.ageGroups
      .find(group => group.value === ageCategory)?.label
  },
}