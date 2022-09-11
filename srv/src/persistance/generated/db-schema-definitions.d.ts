export type Checkins = {
  content: unknown;
  id: string;
  inserted_at: number|string|Date;
  recorded_at: number|string|Date;
  recorded_by: string;
  year: number;
}

export type Families = {
  content: unknown;
  id: string;
  year: number;
}

export type SchoolChildren = {
  content: unknown;
  id: string;
  year: number;
}

export type DB = {
  checkins: Checkins;
  families: Families;
  school_children: SchoolChildren;
}
