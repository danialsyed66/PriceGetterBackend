class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
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
      const sort = this.queryString.sort.split(',').join(' ');

      this.query = this.query.sort(sort);
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

  paginate(resultsPerPage) {
    const page = +this.queryString.page || 1;
    const skip = resultsPerPage * (page - 1);

    this.query = this.query.limit(+resultsPerPage).skip(+skip);
    return this;
  }
}

module.exports = ApiFeatures;