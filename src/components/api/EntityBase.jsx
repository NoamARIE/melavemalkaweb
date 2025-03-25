import { api } from './firebase';

export class EntityBase {
  static collection = '';

  static async create(data) {
    return api.createDocument(this.collection, data);
  }

  static async bulkCreate(items) {
    return Promise.all(items.map(item => this.create(item)));
  }

  static async update(id, data) {
    return api.updateDocument(this.collection, id, data);
  }

  static async delete(id) {
    return api.deleteDocument(this.collection, id);
  }

  static async get(id) {
    return api.getDocument(this.collection, id);
  }

  static async list(orderBy = '-created_date', limit = 100) {
    return api.listDocuments(this.collection, orderBy, limit);
  }

  static async filter(filters, orderBy = '-created_date', limit = 100) {
    return api.filterDocuments(this.collection, filters, orderBy, limit);
  }
}