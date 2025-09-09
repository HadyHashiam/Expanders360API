export class ApiFeaturesMongo<T> {
  private paginationResult: any;
  constructor(private query: any, private queryString: any) {}

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excluded = ['page', 'sort', 'limit', 'fields', 'keyword'];
    excluded.forEach(el => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      match => `$${match}`,
    );
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  search(fields: string[]) {
    if (this.queryString.keyword) {
      const keyword = this.queryString.keyword;
      const searchConditions = fields.map(field => ({
        [field]: { $regex: keyword, $options: 'i' },
      }));
      const currentFilter = this.query.getFilter();
      this.query = this.query.find({
        ...currentFilter,
        $or: searchConditions,
      });
    }
    return this;
  }

  paginate(documentsCount: number) {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;
    const pagination: any = {
      currentPage: page,
      limit,
      numberOfPages: Math.ceil(documentsCount / limit),
    };
    if (endIndex < documentsCount) pagination.next = page + 1;
    if (skip > 0) pagination.prev = page - 1;
    this.paginationResult = pagination;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  getFilter() {
    return this.query.getFilter();
  }

  getQuery() {
    return this.query;
  }

  getPagination() {
    return this.paginationResult;
  }
}