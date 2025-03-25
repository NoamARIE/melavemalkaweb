import { api } from '../api/firebase';
import { EntityBase } from '../api/EntityBase';

export class UserService extends EntityBase {
  static collection = 'users';

  static async me() {
    const user = await api.getCurrentUser();
    if (!user) throw new Error('Not logged in');
    
    try {
      const results = await this.filter({ email: user.email });
      return results[0];
    } catch (error) {
      // If user document doesn't exist, create it
      return this.create({
        email: user.email,
        full_name: user.displayName,
        favorites: []
      });
    }
  }

  static async login() {
    return api.login();
  }

  static async logout() {
    return api.logout();
  }

  static async updateMyUserData(data) {
    const user = await api.getCurrentUser();
    if (!user) throw new Error('Not logged in');
    
    const existingData = await this.filter({ email: user.email });
    if (existingData.length > 0) {
      return this.update(existingData[0].id, data);
    }
    return this.create({ ...data, email: user.email });
  }
}