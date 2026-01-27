export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  score: number;
  scraped_at: string;
  applied: boolean;
}
