import api from './api';

export interface UploadGisResponse {
  success: boolean;
  message: string;
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
      console.log('Uploading GIS files for zone:', zoneId);
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
