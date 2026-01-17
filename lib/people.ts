export const PERSON_1 = process.env.NEXT_PUBLIC_PERSON_1 || "Person 1";
export const PERSON_2 = process.env.NEXT_PUBLIC_PERSON_2 || "Person 2";

export const PEOPLE = [PERSON_1, PERSON_2] as const;

export const WHO_COLORS: Record<string, string> = {
  [PERSON_1]: process.env.NEXT_PUBLIC_PERSON_1_COLOR || "oklch(0.68 0.16 250)",
  [PERSON_2]: process.env.NEXT_PUBLIC_PERSON_2_COLOR || "oklch(0.75 0.18 350)",
};
