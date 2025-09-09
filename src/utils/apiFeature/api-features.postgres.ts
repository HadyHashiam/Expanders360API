import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { RESOURCE_CONSTRAINTS } from '../constant';

export class ApiFeatures<Entity extends ObjectLiteral> {
  constructor(
    private queryBuilder: SelectQueryBuilder<Entity>,
    private queryParams: any,
    private resourceName: keyof typeof RESOURCE_CONSTRAINTS,
    private alias: string,
  ) {}

  private hasJoin(joinAlias: string): boolean {
    // @ts-ignore - access expressionMap for existing joins
    return this.queryBuilder.expressionMap?.joinAttributes?.some((j: any) => j.alias?.name === joinAlias);
  }

  private ensureCountryJoin() {
    if (!this.hasJoin('country')) {
      this.queryBuilder.leftJoinAndSelect(`${this.alias}.country`, 'country');
    }
  }

  filter() {
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'keyword'];
    const filters = { ...this.queryParams };
    excludedFields.forEach((el) => delete filters[el]);

    // Special service filter applied for Projects/Vendors on JSON arrays
    if (this.queryParams.service) {
      const svc = this.queryParams.service;
      if (this.resourceName === 'PROJECTS') {
        this.queryBuilder.andWhere(`${this.alias}.services_needed::text ILIKE :svc`, { svc: `%"${svc}"%` });
      }
      if (this.resourceName === 'VENDORS') {
        this.queryBuilder.andWhere(`${this.alias}.services_offered::text ILIKE :svc2`, { svc2: `%"${svc}"%` });
      }
    }

    Object.keys(filters).forEach((key) => {
      if (!RESOURCE_CONSTRAINTS[this.resourceName].filterableFields.includes(key)) return;
      if (typeof filters[key] === 'object') {
        Object.keys(filters[key]).forEach((op) => {
          const value = filters[key][op];
          if (['gte', 'gt', 'lte', 'lt'].includes(op)) {
            let operator = '';
            if (op === 'gte') operator = '>=';
            if (op === 'gt') operator = '>';
            if (op === 'lte') operator = '<=';
            if (op === 'lt') operator = '<';
            this.queryBuilder.andWhere(`${this.alias}.${key} ${operator} :${key}_${op}`, { [`${key}_${op}`]: value });
          }
        });
      } else {
        if (key === 'country' && this.resourceName === 'PROJECTS') {
          this.ensureCountryJoin();
          // Support both country name and country ID
          if (isNaN(Number(filters[key]))) {
            this.queryBuilder.andWhere(`country.name = :${key}`, { [key]: filters[key] });
          } else {
            this.queryBuilder.andWhere(`country.id = :${key}`, { [key]: parseInt(filters[key]) });
          }
        } else if (key === 'countryId' && this.resourceName === 'PROJECTS') {
          // Filter by countryId directly
          this.queryBuilder.andWhere(`${this.alias}.countryId = :${key}`, { [key]: parseInt(filters[key]) });
        } else if (key === 'countries_supported' && this.resourceName === 'VENDORS') {
          // Support both country names and country IDs
          if (isNaN(Number(filters[key]))) {
            // Search by country name - use a subquery to get the country ID
            this.queryBuilder.andWhere(`EXISTS (
              SELECT 1 FROM "Countries" c 
              WHERE c.name = :${key}_name 
              AND ${this.alias}.countries_supported::jsonb @> ('[' || c.id || ']')::jsonb
            )`, { 
              [`${key}_name`]: filters[key]
            });
          } else {
            // Search by country ID in JSON array
            this.queryBuilder.andWhere(`${this.alias}.countries_supported::jsonb @> :${key}`, { 
              [key]: JSON.stringify([parseInt(filters[key])])
            });
          }
        } else if (key === 'services_offered' && this.resourceName === 'VENDORS') {
          // Support both service names and service IDs
          if (isNaN(Number(filters[key]))) {
            // Search by service name - use a subquery to get the service ID
            this.queryBuilder.andWhere(`EXISTS (
              SELECT 1 FROM "Services" s 
              WHERE s.name = :${key}_name 
              AND ${this.alias}.services_offered::jsonb @> ('[' || s.id || ']')::jsonb
            )`, { 
              [`${key}_name`]: filters[key]
            });
          } else {
            // Search by service ID in JSON array
            this.queryBuilder.andWhere(`${this.alias}.services_offered::jsonb @> :${key}`, { 
              [key]: JSON.stringify([parseInt(filters[key])])
            });
          }
        } else if (key === 'services_needed' && this.resourceName === 'PROJECTS') {
          // Support both service names and service IDs
          if (isNaN(Number(filters[key]))) {
            // Search by service name - use a subquery to get the service ID
            this.queryBuilder.andWhere(`EXISTS (
              SELECT 1 FROM "Services" s 
              WHERE s.name = :${key}_name 
              AND ${this.alias}.services_needed::jsonb @> ('[' || s.id || ']')::jsonb
            )`, { 
              [`${key}_name`]: filters[key]
            });
          } else {
            // Search by service ID in JSON array
            this.queryBuilder.andWhere(`${this.alias}.services_needed::jsonb @> :${key}`, { 
              [key]: JSON.stringify([parseInt(filters[key])])
            });
          }
        } else {
          this.queryBuilder.andWhere(`${this.alias}.${key} = :${key}`, { [key]: filters[key] });
        }
      }
    });
    return this;
  }

  search() {
    const searchFields = RESOURCE_CONSTRAINTS[this.resourceName].searchableFields;
    if (this.queryParams.keyword) {
      const keyword = this.queryParams.keyword;
      const conditions = searchFields
        .map((field) => {
          if (typeof field === 'string') {
            if (field === 'country' && this.resourceName === 'PROJECTS') {
              this.ensureCountryJoin();
              // Support both country name and country ID search
              return `(country.name ILIKE :keyword OR country.id::text ILIKE :keyword)`;
            }
            return `${this.alias}.${field} ILIKE :keyword`;
          } else {
            // For JSON array ID fields, support searching by related name (EXISTS) and by numeric ID text
            if (field.field === 'countries_supported') {
              return `(
                EXISTS (
                  SELECT 1 FROM "Countries" c
                  WHERE c.name ILIKE :keyword
                    AND ${this.alias}.countries_supported::jsonb @> ('[' || c.id || ']')::jsonb
                )
                OR ${this.alias}.countries_supported::text ILIKE :keyword_id
              )`;
            }
            if (field.field === 'services_offered') {
              return `(
                EXISTS (
                  SELECT 1 FROM "Services" s
                  WHERE s.name ILIKE :keyword
                    AND ${this.alias}.services_offered::jsonb @> ('[' || s.id || ']')::jsonb
                )
                OR ${this.alias}.services_offered::text ILIKE :keyword_id
              )`;
            }
            if (field.field === 'services_needed') {
              return `(
                EXISTS (
                  SELECT 1 FROM "Services" s
                  WHERE s.name ILIKE :keyword
                    AND ${this.alias}.services_needed::jsonb @> ('[' || s.id || ']')::jsonb
                )
                OR ${this.alias}.services_needed::text ILIKE :keyword_id
              )`;
            }
            return `${this.alias}.${field.field}::text ILIKE :keyword`;
          }
        })
        .filter(Boolean)
        .join(' OR ');

      if (conditions) {
        // For JSON fields, we need to search both for names and IDs
        const keywordParams: any = { keyword: `%${keyword}%` };
        if (conditions.includes('keyword_id')) {
          keywordParams.keyword_id = `%${keyword}%`;
        }
        this.queryBuilder.andWhere(`(${conditions})`, keywordParams);
      }
    }
    return this;
  }

  sort() {
    const allowedFields = RESOURCE_CONSTRAINTS[this.resourceName].sortableFields;
    if (this.queryParams.sort) {
      const sortBy = this.queryParams.sort.split(',').map((s: string) => s.trim());
      sortBy.forEach((field: string) => {
        const cleanField = field.startsWith('-') ? field.slice(1) : field;
        if (!allowedFields.includes(cleanField)) return;
        const order: 'ASC' | 'DESC' = field.startsWith('-') ? 'DESC' : 'ASC';
        this.queryBuilder.addOrderBy(`${this.alias}.${cleanField}`, order);
      });
    } else {
      this.queryBuilder.addOrderBy(`${this.alias}.createdAt`, 'DESC');
    }
    return this;
  }

  paginate(totalCount: number) {
    const page = parseInt(this.queryParams.page) || 1;
    const limit = parseInt(this.queryParams.limit) || 10;
    const skip = (page - 1) * limit;
    this.queryBuilder.skip(skip).take(limit);
    const pagination: any = {
      currentPage: page,
      limit,
      numberOfPages: Math.ceil(totalCount / limit),
    };
    if (page * limit < totalCount) pagination.next = page + 1;
    if (skip > 0) pagination.prev = page - 1;
    return { queryBuilder: this.queryBuilder, pagination };
  }

  getQueryBuilder() {
    return this.queryBuilder;
  }
}