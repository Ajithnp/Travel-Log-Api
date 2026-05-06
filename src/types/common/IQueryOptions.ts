export type CustomQueryOptions = {
  skip: number;
  limit: number;
  sort: Record<string, 1 | -1>;
};
