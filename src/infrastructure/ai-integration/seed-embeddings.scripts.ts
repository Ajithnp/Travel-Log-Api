import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import { container } from 'tsyringe';

import mongoose from 'mongoose';
import SchedulePackageModel from '../../models/schedule.model';

import { IEmbeddingService } from '../../interfaces/service_interfaces/IEmbeddingService';
import { DependencyInjection } from '../../di';
import { SCHEDULE_STATUS } from '../../shared/constants/constants';


DependencyInjection.registerDependencies();

const embeddingService = container.resolve<IEmbeddingService>('IEmbeddingService');

async function seedEmbeddings() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.DB_URL!);
    console.log('✅ MongoDB Connected');

   
    const schedules = await SchedulePackageModel.find({
      status: SCHEDULE_STATUS.UPCOMING,
      // startDate:{$gte:new Date().toISOString()}
    }).select('_id packageId');

    console.log(`Found ${schedules.length} upcoming schedules to embed`);

    if (schedules.length === 0) {
      console.log('⚠️ No upcoming schedules found. Add schedules first!');
      return;
    }

 
    let success = 0;
    let failed = 0;

    for (const schedule of schedules) {
      try {
        await embeddingService.generateAndSaveEmbedding(schedule._id.toString(),schedule.packageId.toString());
        success++;

        
        // 1 second delay between each embedding call
        await new Promise((resolve) => setTimeout(resolve, 1000));

      } catch (err) {
        console.error(`❌ Failed for schedule ${schedule._id}:`, err);
        failed++;
      }
    }

    // 4. Summary
    console.log('\n─────────────────────────');
    console.log('✅ Seeding Complete!');
    console.log(`   Success : ${success}`);
    console.log(`   Failed  : ${failed}`);
    console.log(`   Total   : ${schedules.length}`);
    console.log('─────────────────────────');

  } catch (error) {
    console.error('❌ Seed script error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
    process.exit(0);
  }
}

seedEmbeddings();