
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAllTables1757378810400 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Countries Table
    await queryRunner.query(`
      CREATE TABLE "Countries" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
      )
    `);

    // 2. Services Table
    await queryRunner.query(`
      CREATE TABLE "Services" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
      )
    `);

    // 3. Users Table
    await queryRunner.query(`
      CREATE TABLE "Users" (
        id SERIAL PRIMARY KEY,
        email VARCHAR(250) NOT NULL UNIQUE,
        username VARCHAR(150),
        password VARCHAR(255) NOT NULL,
        "userType" VARCHAR(20) NOT NULL DEFAULT 'CLIENT',
        "isAccountVerified" BOOLEAN DEFAULT FALSE,
        "emailVerificationToken" VARCHAR(250),
        "resetPasswordToken" VARCHAR(250),
        "resetPasswordTokenExpiresAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Clients Table
    await queryRunner.query(`
      CREATE TABLE "Clients" (
        id SERIAL PRIMARY KEY,
        "userId" INT NOT NULL,
        "company_name" VARCHAR(150) NOT NULL,
        "contact_email" VARCHAR(250) NOT NULL UNIQUE,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "Users"(id) ON DELETE CASCADE
      )
    `);

    // 5. Projects Table
    await queryRunner.query(`
      CREATE TABLE "Projects" (
        id SERIAL PRIMARY KEY,
        "countryId" INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        "services_needed" JSON,
        budget DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        "clientId" INT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("countryId") REFERENCES "Countries"(id) ON DELETE RESTRICT,
        FOREIGN KEY ("clientId") REFERENCES "Clients"(id) ON DELETE CASCADE
      )
    `);

    // 6. Vendors Table
    await queryRunner.query(`
      CREATE TABLE "Vendors" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(250) NOT NULL UNIQUE,
        "countries_supported" JSON,
        "services_offered" JSON,
        rating DECIMAL(3,1) NOT NULL,
        "response_sla_hours" FLOAT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 7. Vendors_Countries Join Table
    await queryRunner.query(`
      CREATE TABLE "vendors_countries" (
        "vendorId" INT NOT NULL,
        "countryId" INT NOT NULL,
        PRIMARY KEY ("vendorId", "countryId"),
        FOREIGN KEY ("vendorId") REFERENCES "Vendors"(id) ON DELETE CASCADE,
        FOREIGN KEY ("countryId") REFERENCES "Countries"(id) ON DELETE CASCADE
      )
    `);

    // 8. Vendors_Services Join Table
    await queryRunner.query(`
      CREATE TABLE "vendors_services" (
        "vendorId" INT NOT NULL,
        "serviceId" INT NOT NULL,
        PRIMARY KEY ("vendorId", "serviceId"),
        FOREIGN KEY ("vendorId") REFERENCES "Vendors"(id) ON DELETE CASCADE,
        FOREIGN KEY ("serviceId") REFERENCES "Services"(id) ON DELETE CASCADE
      )
    `);

    // 9. Sessions Table
    await queryRunner.query(`
      CREATE TABLE "Sessions" (
        id SERIAL PRIMARY KEY,
        "userId" INT NOT NULL,
        "refreshToken" VARCHAR(255) NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "deviceInfo" JSON DEFAULT '{}',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 10. Matches Table
    await queryRunner.query(`
      CREATE TABLE "Matches" (
        id SERIAL PRIMARY KEY,
        "projectId" INT NOT NULL,
        "vendorId" INT NOT NULL,
        "countryId" INT NOT NULL,
        score DECIMAL(5,2) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "notifiedAt" TIMESTAMP,
        "is_sla_expired" BOOLEAN DEFAULT FALSE,
        FOREIGN KEY ("projectId") REFERENCES "Projects"(id) ON DELETE CASCADE,
        FOREIGN KEY ("vendorId") REFERENCES "Vendors"(id) ON DELETE CASCADE,
        FOREIGN KEY ("countryId") REFERENCES "Countries"(id) ON DELETE RESTRICT
      )
    `);

    // 11. SystemConfigs Table
    await queryRunner.query(`
      CREATE TABLE "Configs" (
        id SERIAL PRIMARY KEY,
        "key" VARCHAR(100) NOT NULL UNIQUE,
        value FLOAT NOT NULL,
        description VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "SystemConfigs"`);
    await queryRunner.query(`DROP TABLE "Matches"`);
    await queryRunner.query(`DROP TABLE "Sessions"`);
    await queryRunner.query(`DROP TABLE "vendors_services"`);
    await queryRunner.query(`DROP TABLE "vendors_countries"`);
    await queryRunner.query(`DROP TABLE "Vendors"`);
    await queryRunner.query(`DROP TABLE "Projects"`);
    await queryRunner.query(`DROP TABLE "Clients"`);
    await queryRunner.query(`DROP TABLE "Users"`);
    await queryRunner.query(`DROP TABLE "Services"`);
    await queryRunner.query(`DROP TABLE "Countries"`);
  }
}
