import { PACKAGE_STATUS } from 'shared/constants/constants';
import { z } from 'zod';
const PackageCategoryEnum = z.enum(['weekend', 'adventure', 'family', 'honeymoon']);

const DifficultyLevelEnum = z.enum(['easy', 'moderate', 'hard']);

const ActivityTypeEnum = z.enum(['travel', 'meal', 'stay', 'sightseeing', 'activity', 'free']);

const basePackageBackendSchema = z.object({
  status: z.nativeEnum(PACKAGE_STATUS),
});
