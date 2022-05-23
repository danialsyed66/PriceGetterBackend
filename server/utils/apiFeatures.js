class ApiFeatures {
  constructor(query, queryString, limit) {
    this.query = query;
    this.queryString = queryString;
    this.limit = limit;
    this.docsFound;
  }

  search() {
    const { keyword } = this.queryString;

    const aggregate = keyword
      ? {
          name: {
            $regex: keyword,
            $options: 'i',
          },
        }
      : {};

    this.query = this.query.find(aggregate);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sort = this.queryString.sort.split(',');

      const sortArr = [sort[0], sort[1] === 'asd' ? 1 : -1];

      this.query = this.query.sort([sortArr, ['clicks updatedAt', -1]]);
    } else {
      this.query = this.query.sort([
        ['clicks', -1],
        ['name', 1],
      ]);
    }

    return this;
  }

  limitFields() {
    if (this.limit) {
      this.query = this.query.select(this.limit);
    } else if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');

      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  async count() {
    this.docsFound = await this.query.countDocuments();

    return this;
  }

  paginate(resultsPerPage) {
    const page = +this.queryString.page || 1;
    const skip = resultsPerPage * (page - 1);

    this.query = this.query.limit(+resultsPerPage).skip(+skip);

    return this;
  }
}

module.exports = ApiFeatures;
