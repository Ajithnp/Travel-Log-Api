export interface PaginatedData<T> {
  data: T[];
  currentPage?: number;
  totalPages?: number;
  totalDocs?: number;
}
