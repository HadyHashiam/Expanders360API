import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { RESOURCE_CONSTRAINTS } from '../constant';

export class ApiFeatures<Entity extends ObjectLiteral> {
  constructor(
    private queryBuilder: SelectQueryBuilder<Entity>,
    private queryParams: any,
    private resourceName: keyof typeof RESOURCE_CONSTRAINTS,
    private alias: string,
  ) {}

  filter() {
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'keyword'];
    const filters = { ...this.queryParams };
    excludedFields.forEach((el) => delete filters[el]);
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
        if (['services_needed', 'countries_supported', 'services_offered'].includes(key)) {
          // For JSON array fields, check if the value exists in the array
          this.queryBuilder.andWhere(`${this.alias}.${key}::text LIKE :${key}_search`, { [`${key}_search`]: `%${filters[key]}%` });
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
            return `${this.alias}.${field} ILIKE :keyword`;
          } else {
            // For JSON array fields, search within the array content
            return `${this.alias}.${field.field}::text ILIKE :keyword`;
          }
        })
        .filter(Boolean)
        .join(' OR ');

      if (conditions) {
        this.queryBuilder.andWhere(`(${conditions})`, { keyword: `%${keyword}%` });
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