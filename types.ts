
export interface MissionItem {
  id: number;
  label: string;
  category: MissionCategory;
  checked: boolean;
}

export enum MissionCategory {
  PRAYER = 'Prayer',
  BIBLE_READING = 'Bible Reading',
  TRUTH_BOOK = 'Reading Truth Book',
  SERMON = 'Watching Sermon'
}

export interface StageInfo {
  level: number;
  title: string;
  description: string;
  imagePrompt: string;
}
