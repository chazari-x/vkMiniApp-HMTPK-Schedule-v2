export interface Schedule {
  date: string;
  lesson: Lesson[] | null;
  href: string;
  timestamp: number | undefined;
}

export interface Lesson {
  num: string;
  time: string;
  name: string;
  room: string;
  location: string;
  group: string;
  subgroup: string;
  teacher: string;
}

export interface MergedLesson {
  num: string;
  time: string;
  name: string;
  subgroups: Subgroups[];
}

export interface Subgroups {
  teacher: string,
  room: string,
  location: string,
  group: string,
  subgroup: string,
}

export interface Option {
  label: string;
  value: string;
}

export interface UserSettings {
  group: string;
  teacher: string;
  subgroup: Subgroup;
}

export type Subgroup = '1 и 2' | '1' | '2';