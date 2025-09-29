import { AgeCategories } from '@/api/resolvers/competence/competence.resolver.ts';
import { useAgeGroups } from '@/shared/UseAgeGroups.ts';
import { useGradeOptions } from '@/shared/UseGradeOptions.ts';
import type { ChildOutputDto } from '@/api/resolvers/child/dto/output/child-output.dto.ts';

export const FormatManager = {
  ageGroups: useAgeGroups,
  gradeOptions: useGradeOptions,

  formatBirthDateFromDTO(birthDate: string) {
    const parts = birthDate.split("-");
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
  getAgeGroupByAge(age: number, learningClass: number) {
    if (age === 7) {
      return this.ageGroups
        .find(group => learningClass > 0
          ? group.value === AgeCategories.EARLY_SCHOOL
          : group.value === AgeCategories.PRESCHOOL
        )
    }
    const group = this.ageGroups.find(group => {
      const edges = group.label.split(" ")[0].split("-");
      const min = parseInt(edges[0]);
      const max = parseInt(edges[1]);
      return min <= age && age <= max;
    });
    return group ? group : undefined;
  },
  calculateGrade(child: ChildOutputDto) {
    return this.gradeOptions.find(grade => grade.value === child.childDocuments.learningClass)?.label
  },
}