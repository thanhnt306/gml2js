import api from './api';

export interface UploadGisResponse {
  success: boolean;
  message: string;
  attributes?: Record<string, string[]>;
  taskId?: string;
  /** GeoJSON network returned directly (fallback if not using async flow) */
  network?: {
    nodes: any;
    pipes: any;
    issues: any[];
  };
}

export interface ParseTaskStatusResponse {
  success: boolean;
  percentage: number;
  message: string;
  completed: boolean;
  hasError: boolean;
  errorDetails?: string;
  network?: {
    nodes: any;
    pipes: any;
    issues: any[];
  };
}

class NetworkService {
  /**
   * Uploads GIS files for a specific zone.
   * @param zoneId The ID of the zone
   * @param files Array of File objects (shp, dbf, prj, etc.)
   */
  async uploadGisFiles(zoneId: string, files: File[]): Promise<UploadGisResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await api.post(`/gis/zones/${zoneId}/network/upload-gis`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading GIS files:', error);
      throw error;
    }
  }

  /**
   * Saves assigned roles for GIS files and their attributes.
   * @param zoneId The ID of the zone
   * @param roles Data object containing role assignments
   */
  async saveNetworkRoles(zoneId: string, roles: any): Promise<UploadGisResponse> {
    try {
      console.log('Saving network roles:', roles);
      const response = await api.post(`/gis/zones/${zoneId}/network/save-roles`, roles);
      return response.data;
    } catch (error) {
      console.error('Error saving network roles:', error);
      throw error;
    }
  }

  /**
   * Polls the status of an async parsing task.
   */
  async getParseTaskStatus(zoneId: string, taskId: string): Promise<ParseTaskStatusResponse> {
    try {
        const response = await api.get(`/gis/zones/${zoneId}/network/task-status/${taskId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting task status:', error);
        throw error;
    }
  }

  /**
   * Uploads Elevation file for a specific zone.

   * @param zoneId The ID of the zone
   * @param file The .tif file
   */
  async uploadElevationFile(zoneId: string, file: File): Promise<UploadGisResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(`/gis/zones/${zoneId}/network/upload-elevation`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading Elevation file:', error);
      throw error;
    }
  }
}

export default new NetworkService();
