const { MongoClient } = require('mongodb');
const monitorSeed = require('../../database/monitor');

const TABLE_MAP = {
  Engine: 'Monitor',
};

const AUTO_CREATED_AT_TABLES = new Set(['HistoryRecord']);

function mapTableName(tableName) {
  return TABLE_MAP[tableName] || tableName;
}

function parseProjection(columns) {
  if (!columns || columns === '*') {
    return null;
  }

  return columns
    .split(',')
    .map((field) => field.trim())
    .filter(Boolean)
    .reduce((projection, field) => {
      projection[field] = 1;
      return projection;
    }, {});
}

class MongoQueryBuilder {
  constructor(db, tableName) {
    this.db = db;
    this.originalTableName = tableName;
    this.tableName = mapTableName(tableName);
    this.collection = db.collection(this.tableName);
    this.operation = 'select';
    this.filter = {};
    this.projection = null;
    this.expectSingle = false;
    this.payload = null;
  }

  select(columns = '*') {
    this.operation = 'select';
    this.projection = parseProjection(columns);
    return this;
  }

  eq(field, value) {
    this.filter[field] = value;

    if (this.operation === 'select' && !this.expectSingle) {
      return this;
    }

    return this._execute();
  }

  gte(field, value) {
    const numeric = Number(value);
    const parsedValue = Number.isFinite(numeric) ? numeric : value;
    const existing = this.filter[field] && typeof this.filter[field] === 'object' ? this.filter[field] : {};
    this.filter[field] = {
      ...existing,
      $gte: parsedValue,
    };
    return this;
  }

  update(data) {
    this.operation = 'update';
    this.payload = Array.isArray(data) ? data[0] : data;
    return this;
  }

  insert(rows) {
    this.operation = 'insert';
    this.payload = Array.isArray(rows) ? rows : [rows];
    return this._execute();
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  single() {
    this.expectSingle = true;
    return this._execute();
  }

  then(resolve, reject) {
    return this._execute().then(resolve, reject);
  }

  async _execute() {
    try {
      if (this.operation === 'select') {
        const options = this.projection ? { projection: this.projection } : {};
        const data = await this.collection.find(this.filter, options).toArray();

        if (this.expectSingle) {
          return {
            data: data[0] || null,
            error: null,
          };
        }

        return {
          data,
          error: null,
        };
      }

      if (this.operation === 'update') {
        if (!this.payload || typeof this.payload !== 'object') {
          return { data: null, error: { message: 'Payload update không hợp lệ' } };
        }

        const result = await this.collection.updateMany(this.filter, { $set: this.payload });
        return {
          data: {
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
          },
          error: null,
        };
      }

      if (this.operation === 'insert') {
        const documents = (this.payload || []).map((doc) => {
          const normalized = { ...doc };
          if (AUTO_CREATED_AT_TABLES.has(this.originalTableName) && !normalized.created_at) {
            normalized.created_at = new Date().toISOString();
          }
          return normalized;
        });

        if (documents.length === 0) {
          return { data: [], error: null };
        }

        await this.collection.insertMany(documents);
        return {
          data: documents,
          error: null,
        };
      }

      if (this.operation === 'delete') {
        const result = await this.collection.deleteMany(this.filter);
        return {
          data: {
            deletedCount: result.deletedCount,
          },
          error: null,
        };
      }

      return { data: null, error: { message: 'Operation không được hỗ trợ' } };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error.message,
        },
      };
    }
  }
}

function createDbAdapter(db) {
  return {
    from(tableName) {
      return new MongoQueryBuilder(db, tableName);
    },
  };
}

async function seedMonitorCollection(db) {
  const monitorCollection = db.collection('Monitor');
  const existingCount = await monitorCollection.countDocuments();

  if (!Array.isArray(monitorSeed) || monitorSeed.length === 0) {
    return;
  }

  // Keep Monitor catalog synced with source file; refresh if collection is missing or outdated.
  if (existingCount === monitorSeed.length) {
    return;
  }

  await monitorCollection.deleteMany({});

  await monitorCollection.insertMany(monitorSeed);
}

async function connectMongo(mongoUri, dbName) {
  const client = new MongoClient(mongoUri, {
    maxPoolSize: 10,
  });

  await client.connect();
  const db = client.db(dbName);
  await seedMonitorCollection(db);

  return {
    client,
    db,
  };
}

module.exports = {
  connectMongo,
  createDbAdapter,
};
