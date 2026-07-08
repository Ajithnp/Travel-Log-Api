import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import { container } from 'tsyringe';

import mongoose from 'mongoose';
import SchedulePackageModel from '../../models/schedule.model';

import { IEmbeddingService } from '../../interfaces/service_interfaces/IEmbeddingService';
import { DependencyInjection } from '../../di';
import { SCHEDULE_STATUS } from '../../shared/constants/constants';
import logger from 'config/logger';

DependencyInjection.registerDependencies();

const embeddingService = container.resolve<IEmbeddingService>('IEmbeddingService');

async function seedEmbeddings() {
  try {
    await mongoose.connect(process.env.DB_URL!);

    const schedules = await SchedulePackageModel.find({
      status: SCHEDULE_STATUS.UPCOMING,
      // startDate:{$gte:new Date().toISOString()}
    }).select('_id packageId');

    if (schedules.length === 0) {
      return;
    }

    let success = 0;
    let failed = 0;

    for (const schedule of schedules) {
      try {
        await embeddingService.generateAndSaveEmbedding(
          schedule._id.toString(),
          schedule.packageId.toString(),
        );
        success++;

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (err) {
        logger.error(`Failed for schedule ${schedule._id}:`, err);
        failed++;
      }
    }

    // 4. Summary
    logger.info('\n─────────────────────────');
    logger.info('✅ Seeding Complete!');
    logger.info(`   Success : ${success}`);
    logger.info(`   Failed  : ${failed}`);
    logger.info(`   Total   : ${schedules.length}`);
    logger.info('─────────────────────────');
  } catch (error) {
    logger.error('❌ Seed script error:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('MongoDB Disconnected');
    process.exit(0);
  }
}

seedEmbeddings();
