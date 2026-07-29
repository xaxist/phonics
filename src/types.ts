export interface Lesson {
  id: string;
  rule: string;
  words: string[];
  sentences: string[];
}

export interface World {
  id: number;
  name: string;
  description: string;
  lessons: Lesson[];
}

export interface Database {
  worlds: World[];
}
