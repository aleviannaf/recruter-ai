export interface ISearchResult {
  title: string;
  url: string;
  content: string;
}

export interface ISearchProvider {
  search(query: string, daysAgo?: number): Promise<ISearchResult[]>;
}