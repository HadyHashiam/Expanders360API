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

    const documents = [
      {
        projectId: 7,
        title: 'USA Market Report 1',
        content: 'Example content related to project 7',
        secureUrl: "https://res.cloudinary.com/da2znmant/image/upload/v1757247343/projects/1/documents/kiqbfvmskliscjjozphu.pdf",
        publicId: "projects/1/documents/kiqbfvmskliscjjozphu",
        tags: ["market","AI","Data Analysis"],
        metadata: { region: 'NA', reportType: 'market' },
        createdAt: new Date('2025-08-28T23:42:28.361Z'),
        updatedAt: new Date('2025-08-28T23:42:28.361Z'),
      },
      {
        projectId: 7,
        title: 'USA Market Report 2',
        content: 'Example content related to project 7',
        secureUrl: "https://res.cloudinary.com/da2znmant/image/upload/v1757256010/projects/7/documents/epvpodxc4zchqao2usf2.pdf",
        publicId: "projects/7/documents/epvpodxc4zchqao2usf2",
        tags: ["market","AI","Data Analysis"],
        metadata: { region: 'NA' },
        createdAt: new Date('2025-08-28T23:42:28.361Z'),
        updatedAt: new Date('2025-08-28T23:42:28.361Z'),
      },
      {
        projectId: 10,
        title: 'Project 10 Report',
        content: 'Example content related to project 10',
        secureUrl: "https://res.cloudinary.com/da2znmant/image/upload/v1757256241/projects/10/documents/kyb6l28onrjvyrwm5mrk.pdf",
        publicId: "projects/10/documents/kyb6l28onrjvyrwm5mrk",
        tags: ['API', 'Infrastructure','USA','Integration','SOAP'],
        metadata: { source: 'seed' },
        createdAt: new Date('2025-08-28T23:42:28.361Z'),
        updatedAt: new Date('2025-08-28T23:42:28.361Z'),
      },
      {
        projectId: 9,
        title: 'UProject 9 Report_1',
        content: 'Example content related to project 9',
        secureUrl: "https://res.cloudinary.com/da2znmant/image/upload/v1757256406/projects/9/documents/wnppwvbs6sq8xirscylj.pdf",
        publicId: "projects/9/documents/wnppwvbs6sq8xirscylj",
        tags: ['API', 'Cloud Hosting','KSA','Mobile Development','KOTLIN'],
        metadata: { version: 1 },
        createdAt: new Date('2025-08-28T23:42:28.361Z'),
        updatedAt: new Date('2025-08-28T23:42:28.361Z'),
      },
      {
        projectId: 11,
        title: 'Egypt Market Report 11',
        content: 'Example content related to project 11',
        secureUrl: "https://res.cloudinary.com/da2znmant/image/upload/v1757256484/projects/11/documents/cgptpgl5xxe19xzxua7q.pdf",
        publicId: "projects/11/documents/cgptpgl5xxe19xzxua7q",
        tags: ['API', 'AI' , 'Web', 'Web Development', 'Egypt'],
        metadata: { country: 'EG' },
        createdAt: new Date('2025-08-28T23:42:28.361Z'),
        updatedAt: new Date('2025-08-28T23:42:28.361Z'),
      },
      {
        projectId: 12,
        title: 'Egypt Market Report 12',
        content: 'Example content related to project 12',
        secureUrl: "https://res.cloudinary.com/da2znmant/image/upload/v1757256542/projects/12/documents/n9lozyfv5ckdia74ubqm.pdf",
        publicId: "projects/12/documents/n9lozyfv5ckdia74ubqm",
        tags: ['API', 'AI' , 'Web', 'Web Development', 'Egypt'],
        metadata: {},
        createdAt: new Date('2025-08-28T23:42:28.361Z'),
        updatedAt: new Date('2025-08-28T23:42:28.361Z'),
      },
      {
        projectId: 9,
        title: 'Project 9 Report_2',
        content: 'Example content related to project 9.2',
        secureUrl: "https://res.cloudinary.com/da2znmant/image/upload/v1757256615/projects/9/documents/lzx1u9yfbt0jvoakkg8t.pdf",
        publicId: "projects/9/documents/lzx1u9yfbt0jvoakkg8t",
        tags: ['API' , 'Infrastructure', 'Web Development', 'KSA'],
        metadata: { reviewer: 'ops' },
        createdAt: new Date('2025-08-28T23:42:28.361Z'),
        updatedAt: new Date('2025-08-28T23:42:28.361Z'),
      },
      {
        projectId: 11,
        title: 'USA Market Report 11',
        content: 'Example content related to project 11',
        secureUrl: "https://res.cloudinary.com/da2znmant/image/upload/v1757256669/projects/11/documents/ife6vmijjyexcuamyn3e.pdf",
        publicId: "projects/11/documents/ife6vmijjyexcuamyn3e",
        tags: ['API', 'AI' , 'Web', 'Web Development', 'Egypt'],
        metadata: { migrated: true },
        createdAt: new Date('2025-08-28T23:42:28.361Z'),
        updatedAt: new Date('2025-08-28T23:42:28.361Z'),
      },
      {
        projectId: 1,
        title: 'Egypt Market Report 1',
        content: 'Example content related to project 1',
        secureUrl: "https://res.cloudinary.com/da2znmant/image/upload/v1757247343/projects/1/documents/kiqbfvmskliscjjozphu.pdf",
        publicId: "projects/1/documents/kiqbfvmskliscjjozphu",
        tags: ['System Design', 'AI' , 'Web', 'Web Development', 'Egypt'],
        metadata: { source: 'import' },
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