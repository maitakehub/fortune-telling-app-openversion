import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll, beforeEach } from '@jest/globals';
import { createLogger } from '../server/src/utils/logger';

const logger = createLogger('TestSetup');

let mongod: MongoMemoryServer;

beforeAll(async () => {
  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    logger.info('Connected to in-memory database');
  } catch (error) {
    logger.error('Failed to connect to in-memory database:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    await mongoose.connection.close();
    await mongod.stop();
    logger.info('Closed database connection and stopped in-memory database');
  } catch (error) {
    logger.error('Failed to close database connection:', error);
    throw error;
  }
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
}); 