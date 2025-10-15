import { Request } from 'express';

export interface PaginationOptions {
  page: number;
  limit: number;
  search: string;
  selectedFilter: string;
}

export const getPaginationOptions = (req: Request): PaginationOptions => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 5;
  const search = (req.query.search as string) || '';
  const selectedFilter = (req.query.selectedFilter as string) || '';

  return { page, limit, search, selectedFilter };
};
