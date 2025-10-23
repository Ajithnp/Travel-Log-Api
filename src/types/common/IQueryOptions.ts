import { SortOrder } from 'mongoose';

export type CustomQueryOptions = {
  skip?: number;
  limit?: number;
  sort?: Record<string, SortOrder>;
};
