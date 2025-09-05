import mongoose from 'mongoose';
import { DocumentSchema } from '../Modules/documents/entities/document.entity';
  import 'dotenv/config';

async function connectWithRetry(uri: string, maxAttempts = 10, delayMs = 2000) {
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      await mongoose.connect(uri);
      return;
    } catch (err) {
      attempt += 1;
      if (attempt >= maxAttempts) throw err;
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
}

async function seed() {
  const mongoUri = process.env.MONGO_URI ;

  try {
    if(mongoUri){
  await connectWithRetry(mongoUri);
    console.log('Connected to MongoDB');
    }
    const DocumentModel = mongoose.model('Document', DocumentSchema);
    await DocumentModel.deleteMany({}).exec();

    // Seed data
    const documents = [
      {
        projectId: 7,
        title: 'USA Market Report 1',
        content: 'Example content related to project 7',
        filePath: './Uploads/documents/project_1_1756424548343-812866295.pdf',
        tags: ['market', 'USA','AI'],
        createdAt: new Date('2025-08-28T23:42:28.361Z'),
        updatedAt: new Date('2025-08-28T23:42:28.361Z'),
      },
      {
        projectId: 8,
        title: 'Project 8 Report',
        content: 'Example content related to project 8',
        filePath: './Uploads/documents/project_1_1756424548343-812863295.pdf',
        tags: ['API', 'GER','System Design','WEB ARCH'],
        createdAt: new Date('2025-08-28T23:42:28.361Z'),
        updatedAt: new Date('2025-08-28T23:42:28.361Z'),
      },
      {
        projectId: 10,
        title: 'Project 10 Report',
        content: 'Example content related to project 10',
        filePath: './Uploads/documents/project_1_1756424548343-635863295.pdf',
        tags: ['API', 'Infrastructure','USA','Integration','SOAP'],
        createdAt: new Date('2025-08-28T23:42:28.361Z'),
        updatedAt: new Date('2025-08-28T23:42:28.361Z'),
      },
      {
        projectId: 9,
        title: 'UProject 9 Report_1',
        content: 'Example content related to project 9',
        filePath: './Uploads/documents/project_1_1756424548343-635863295.pdf',
        tags: ['API', 'Cloud Hosting','KSA','Mobile Development','KOTLIN'],
        createdAt: new Date('2025-08-28T23:42:28.361Z'),
        updatedAt: new Date('2025-08-28T23:42:28.361Z'),
      },
      {
        projectId: 11,
        title: 'Egypt Market Report 11',
        content: 'Example content related to project 11',
        filePath: './Uploads/documents/project_1_1756424548343-635863295.pdf',
        tags: ['API', 'AI' , 'Web', 'Web Development', 'Egypt'],
        createdAt: new Date('2025-08-28T23:42:28.361Z'),
        updatedAt: new Date('2025-08-28T23:42:28.361Z'),
      },
      {
        projectId: 12,
        title: 'Egypt Market Report 12',
        content: 'Example content related to project 12',
        filePath: './Uploads/documents/project_1_1756424548343-635863295.pdf',
        tags: ['API', 'AI' , 'Web', 'Web Development', 'Egypt'],
        createdAt: new Date('2025-08-28T23:42:28.361Z'),
        updatedAt: new Date('2025-08-28T23:42:28.361Z'),
      },
      {
        projectId: 9,
        title: 'Project 9 Report_2',
        content: 'Example content related to project 9.2',
        filePath: './Uploads/documents/project_1_1756424548343-635863295.pdf',
        tags: ['API' , 'Infrastructure', 'Web Development', 'KSA'],
        createdAt: new Date('2025-08-28T23:42:28.361Z'),
        updatedAt: new Date('2025-08-28T23:42:28.361Z'),
      },
      {
        projectId: 11,
        title: 'USA Market Report 11',
        content: 'Example content related to project 11',
        filePath: './Uploads/documents/project_1_1756424548343-635863295.pdf',
        tags: ['API', 'AI' , 'Web', 'Web Development', 'Egypt'],
        createdAt: new Date('2025-08-28T23:42:28.361Z'),
        updatedAt: new Date('2025-08-28T23:42:28.361Z'),
      },
      {
        projectId: 8,
        title: 'GER Market Report 8',
        content: 'Example content related to project 8',
        filePath: './Uploads/documents/project_1_1756424548343-635863295.pdf',
        tags: ['System Design', 'AI' , 'Web', 'Web Development', 'GER'],
        createdAt: new Date('2025-08-28T23:42:28.361Z'),
        updatedAt: new Date('2025-08-28T23:42:28.361Z'),
      },
    ];

    await DocumentModel.insertMany(documents);
    console.log('MongoDB seeded successfully!');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding MongoDB:', error);
    process.exit(1);
  }
}

seed();