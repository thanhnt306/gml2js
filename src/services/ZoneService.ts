import api from './api';

export interface PermissionData {
  userIds: number[];
  userNames: string[];
  permissions: boolean[];
}

export interface CreateZonePayload {
  name: string;
  description: string;
  userId: number;
  userIds: number[];
}

export interface ZoneResponse {
  id: number;
  name: string;
  description: string;
  favorite: boolean;
  // Other potential fields
}

class ZoneService {
  /**
   * Fetches the 3 aligned lists containing user permissions when creating a new Zone.
   * @param userId ID of the user requesting the list.
   * @param company Company context.
   * @returns Object containing userIds, userNames, and permissions boolean alignments.
   */
  async getPermissionUsers(userId: number, company: string): Promise<PermissionData> {
    try {
      const response = await api.get<PermissionData>('/system/permission-users', {
        params: { userId, company }
      });
      return response.data;
    } catch (error) {
      console.error('[ZoneService] Failed to fetch permission users:', error);
      throw error;
    }
  }

  /**
   * Creates a new Zone / Project.
   * @param payload The name, description, and list of user IDs who have permission.
   * @returns The created zone details.
   */
  async createZone(payload: CreateZonePayload): Promise<ZoneResponse> {
    try {
      const response = await api.post<ZoneResponse>('/system/create-zone', payload);
      return response.data;
    } catch (error) {
      console.error('[ZoneService] Failed to create zone:', error);
      throw error;
    }
  }

  /**
   * Fetches all zones/projects the authenticated user has access to.
   */
  async getZones(): Promise<ZoneResponse[]> {
    try {
      const response = await api.get<ZoneResponse[]>('/system/projects');
      return response.data;
    } catch (error) {
      console.error('[ZoneService] Failed to fetch zones:', error);
      throw error;
    }
  }
}

export default new ZoneService();
