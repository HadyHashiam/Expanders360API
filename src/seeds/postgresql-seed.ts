
import { DataSource } from 'typeorm';
import { User } from '../Modules/users/entities/user.entity';
import { Client } from '../Modules/users/clients/entities/client.entity';
import { Vendor } from '../Modules/vendor/entities/vendor.entity';
import { Project } from '../Modules/projects/entities/project.entity';
import { Country } from '../Modules/countries/entities/country.entity';
import { Service } from '../Modules/services/entities/service.entity';
import { UserType } from '../utils/enums';

export async function seedDatabase(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const clientRepository = dataSource.getRepository(Client);
  const vendorRepository = dataSource.getRepository(Vendor);
  const projectRepository = dataSource.getRepository(Project);
  const countryRepository = dataSource.getRepository(Country);
  const serviceRepository = dataSource.getRepository(Service);

  // Countries
  await countryRepository.upsert([
    { name: 'Egypt' },
    { name: 'USA' },
    { name: 'UAE' },
    { name: 'KSA' },
    { name: 'GER' },
    { name: 'ALG' },
  ], ['name']);

  // Services
  await serviceRepository.upsert([
    { name: 'Web Development' },
    { name: 'Infrastructure' },
    { name: 'AI' },
    { name: 'Cloud Hosting' },
    { name: 'Mobile Development' },
    { name: 'IT' },
    { name: 'Integration' },
    { name: 'System Design' },
    { name: 'Data Analysis' },
    { name: 'Security' },
  ], ['name']);

  // Users
  await userRepository.upsert([
    {
      username: 'admin',
      email: 'admin@example.com',
      password: '$2a$10$DlQAXr5qbbA6rLA1QUay4.YhDSu1ewNrApMizDn6ILSzG3iouqsXy',
      userType: UserType.ADMIN,
      isAccountVerified: true,
      emailVerificationToken: null,
      resetPasswordToken: null,
      resetPasswordTokenExpiresAt: null,
    },
    {
      username: 'Client ONE',
      email: 'Client_ONE@gmail.com',
      password: '$2a$10$uJGkMhKgSgv4XN73CaqhD.mGtfXUbeTwO1mRFqUAq60XuUBMrZ4ZG',
      userType: UserType.CLIENT,
      isAccountVerified: true,
      emailVerificationToken: null,
      resetPasswordToken: null,
      resetPasswordTokenExpiresAt: null,
    },
    {
      username: 'Client TWO',
      email: 'Client_TWO@gmail.com',
      password: '$2a$10$uJGkMhKgSgv4XN73CaqhD.mGtfXUbeTwO1mRFqUAq60XuUBMrZ4ZG',
      userType: UserType.CLIENT,
      isAccountVerified: true,
      emailVerificationToken: null,
      resetPasswordToken: null,
      resetPasswordTokenExpiresAt: null,
    },
  ], ['email']);

  const clientOneUser = await userRepository.findOne({ where: { email: 'Client_ONE@gmail.com' } });
  const clientTwoUser = await userRepository.findOne({ where: { email: 'Client_TWO@gmail.com' } });
  if (!clientOneUser || !clientTwoUser) {
    throw new Error('Failed to seed users correctly');
  }

  // Clients
  await clientRepository.upsert([
    {
      company_name: 'Client ONE Corp',
      contact_email: 'Client_ONE@gmail.com',
      userId: clientOneUser.id,
    },
    {
      company_name: 'Client TWO Corp',
      contact_email: 'Client_TWO@gmail.com',
      userId: clientTwoUser.id,
    },
  ], ['contact_email']);

  // Get the actual IDs from the database
  const countries = await countryRepository.find();
  const services = await serviceRepository.find();

  // Create lookup maps
  const countryMap = new Map(countries.map(c => [c.name, c.id]));
  const serviceMap = new Map(services.map(s => [s.name, s.id]));

  // Vendors
  await vendorRepository.upsert([
    {
      name: 'NVIDIA',
      email: 'NVIDIA@gmail.com',
      countries_supported: [countryMap.get('UAE'), countryMap.get('Egypt'), countryMap.get('USA'), countryMap.get('GER')],
      services_offered: [serviceMap.get('Web Development'), serviceMap.get('Infrastructure'), serviceMap.get('AI')],
      rating: 4.8,
      response_sla_hours: 32,
    },
    {
      name: 'GizaSystem',
      email: 'GizaSystem@gmail.com',
      countries_supported: [countryMap.get('UAE'), countryMap.get('Egypt'), countryMap.get('KSA')],
      services_offered: [serviceMap.get('Cloud Hosting'), serviceMap.get('Mobile Development'), serviceMap.get('AI'), serviceMap.get('IT'), serviceMap.get('Security')],
      rating: 4.1,
      response_sla_hours: 30,
    },
    {
      name: 'ValleySoft',
      email: 'ValleySoft@gmail.com',
      countries_supported: [countryMap.get('UAE'), countryMap.get('Egypt'), countryMap.get('KSA')],
      services_offered: [serviceMap.get('Web Development'), serviceMap.get('Cloud Hosting'), serviceMap.get('Integration'), serviceMap.get('System Design')],
      rating: 4.3,
      response_sla_hours: 25,
    },
    {
      name: 'Smart',
      email: 'Smart@gmail.com',
      countries_supported: [countryMap.get('UAE'), countryMap.get('GER'), countryMap.get('KSA')],
      services_offered: [serviceMap.get('Web Development'), serviceMap.get('Cloud Hosting'), serviceMap.get('Integration'), serviceMap.get('System Design')],
      rating: 4.3,
      response_sla_hours: 28,
    },
    {
      name: 'Appel',
      email: 'Appel@gmail.com',
      countries_supported: [countryMap.get('UAE'), countryMap.get('Egypt'), countryMap.get('USA')],
      services_offered: [serviceMap.get('Cloud Hosting'), serviceMap.get('Mobile Development'), serviceMap.get('AI'), serviceMap.get('IT')],
      rating: 4.7,
      response_sla_hours: 26,
    },
    {
      name: 'DELL',
      email: 'DELL@gmail.com',
      countries_supported: [countryMap.get('UAE'), countryMap.get('Egypt'), countryMap.get('USA'), countryMap.get('GER')],
      services_offered: [serviceMap.get('Web Development'), serviceMap.get('AI'), serviceMap.get('System Design'), serviceMap.get('Security')],
      rating: 4.6,
      response_sla_hours: 24,
    },
    {
      name: 'Delta',
      email: 'Delta@gmail.com',
      countries_supported: [countryMap.get('UAE'), countryMap.get('Egypt'), countryMap.get('KSA')],
      services_offered: [serviceMap.get('Cloud Hosting'), serviceMap.get('Mobile Development'), serviceMap.get('AI'), serviceMap.get('System Design'), serviceMap.get('Data Analysis')],
      rating: 4.5,
      response_sla_hours: 30,
    },
    {
      name: 'Sumerage',
      email: 'Sumerage@gmail.com',
      countries_supported: [countryMap.get('UAE'), countryMap.get('Egypt'), countryMap.get('USA'), countryMap.get('ALG')],
      services_offered: [serviceMap.get('Data Analysis'), serviceMap.get('Infrastructure'), serviceMap.get('Cloud Hosting'), serviceMap.get('Integration'), serviceMap.get('Web Development')],
      rating: 4.4,
      response_sla_hours: 48,
    },
    {
      name: 'Vendor A',
      email: 'Vendor_A@gmail.com',
      countries_supported: [countryMap.get('UAE'), countryMap.get('Egypt'), countryMap.get('USA')],
      services_offered: [serviceMap.get('Data Analysis'), serviceMap.get('Infrastructure'), serviceMap.get('Cloud Hosting'), serviceMap.get('Integration'), serviceMap.get('Web Development')],
      rating: 4.3,
      response_sla_hours: 36,
    },
    {
      name: 'Vendor B',
      email: 'Vendor_B@gmail.com',
      countries_supported: [countryMap.get('UAE'), countryMap.get('KSA'), countryMap.get('USA'), countryMap.get('GER')],
      services_offered: [serviceMap.get('Infrastructure'), serviceMap.get('Cloud Hosting'), serviceMap.get('Integration'), serviceMap.get('Web Development'), serviceMap.get('Data Analysis')],
      rating: 4.2,
      response_sla_hours: 40,
    },
  ], ['email']);

  // Populate join for Vendors
  await dataSource.query(`
    INSERT INTO "vendors_countries" ("vendorId", "countryId")
    SELECT v.id, json_array_elements_text(v.countries_supported)::integer AS countryId
    FROM "Vendors" v
    WHERE v.countries_supported IS NOT NULL
    ON CONFLICT DO NOTHING
  `);

  await dataSource.query(`
    INSERT INTO "vendors_services" ("vendorId", "serviceId")
    SELECT v.id, json_array_elements_text(v.services_offered)::integer AS serviceId
    FROM "Vendors" v
    WHERE v.services_offered IS NOT NULL
    ON CONFLICT DO NOTHING
  `);

  const clientOne = await clientRepository.findOne({ where: { contact_email: 'Client_ONE@gmail.com' } });
  const clientTwo = await clientRepository.findOne({ where: { contact_email: 'Client_TWO@gmail.com' } });
  if (!clientOne || !clientTwo) {
    throw new Error('Failed to seed clients correctly');
  }

  // Projects
  const projects = [
    {
      countryId: countryMap.get('Egypt'),
      title: 'Project 1',
      description: 'Project 1 description',
      services_needed: [serviceMap.get('Cloud Hosting'), serviceMap.get('Web Development')],
      budget: 30000,
      status: 'PENDING',
      clientId: clientOne.id,
    },
    {
      countryId: countryMap.get('USA'),
      title: 'Project 2',
      description: 'Project 2 description',
      services_needed: [serviceMap.get('Cloud Hosting'), serviceMap.get('Web Development')],
      budget: 28000,
      status: 'PENDING',
      clientId: clientTwo.id,
    },
    {
      countryId: countryMap.get('KSA'),
      title: 'Project 3',
      description: 'Project 3 description',
      services_needed: [serviceMap.get('AI'), serviceMap.get('Cloud Hosting')],
      budget: 29000,
      status: 'PENDING',
      clientId: clientOne.id,
    },
    {
      countryId: countryMap.get('GER'),
      title: 'Project 4',
      description: 'Project 4 description',
      services_needed: [serviceMap.get('Infrastructure'), serviceMap.get('System Design')],
      budget: 18000,
      status: 'PENDING',
      clientId: clientTwo.id,
    },
    {
      countryId: countryMap.get('USA'),
      title: 'Project 5',
      description: 'Project 5 description',
      services_needed: [serviceMap.get('Web Development'), serviceMap.get('AI')],
      budget: 32000,
      status: 'PENDING',
      clientId: clientOne.id,
    },
    {
      countryId: countryMap.get('Egypt'),
      title: 'Project 6',
      description: 'Project 6 description',
      services_needed: [serviceMap.get('Data Analysis'), serviceMap.get('Integration')],
      budget: 36000,
      status: 'PENDING',
      clientId: clientTwo.id,
    },
    {
      countryId: countryMap.get('USA'),
      title: 'Project 7',
      description: 'Project 7 description',
      services_needed: [serviceMap.get('Data Analysis'), serviceMap.get('AI')],
      budget: 42000,
      status: 'PENDING',
      clientId: clientTwo.id,
    },
    {
      countryId: countryMap.get('GER'),
      title: 'Project 8',
      description: 'Project 8 description',
      services_needed: [serviceMap.get('System Design'), serviceMap.get('AI')],
      budget: 34000,
      status: 'PENDING',
      clientId: clientTwo.id,
    },
    {
      countryId: countryMap.get('KSA'),
      title: 'Project 9',
      description: 'Project 9 description',
      services_needed: [serviceMap.get('Infrastructure'), serviceMap.get('System Design')],
      budget: 56000,
      status: 'PENDING',
      clientId: clientOne.id,
    },
    {
      countryId: countryMap.get('USA'),
      title: 'Project 10',
      description: 'Project 10 description',
      services_needed: [serviceMap.get('Infrastructure'), serviceMap.get('Integration')],
      budget: 56000,
      status: 'PENDING',
      clientId: clientOne.id,
    },
    {
      countryId: countryMap.get('KSA'),
      title: 'Project 11',
      description: 'Project 11 description',
      services_needed: [serviceMap.get('Mobile Development'), serviceMap.get('Cloud Hosting')],
      budget: 62000,
      status: 'PENDING',
      clientId: clientTwo.id,
    },
    {
      countryId: countryMap.get('Egypt'),
      title: 'Project 12',
      description: 'Project 12 description',
      services_needed: [serviceMap.get('Web Development'), serviceMap.get('AI')],
      budget: 60000,
      status: 'PENDING',
      clientId: clientOne.id,
    },
    {
      countryId: countryMap.get('Egypt'),
      title: 'Project 13',
      description: 'Project 13 description',
      services_needed: [serviceMap.get('Mobile Development'), serviceMap.get('Infrastructure')],
      budget: 47000,
      status: 'PENDING',
      clientId: clientTwo.id,
    },
  ];

  for (const p of projects) {
    const exists = await projectRepository.findOne({ where: { title: p.title, clientId: p.clientId } });
    if (!exists) {
      await projectRepository.save(projectRepository.create(p));
    }
  }

  console.log('PostgreSQL seeded successfully!');
}
