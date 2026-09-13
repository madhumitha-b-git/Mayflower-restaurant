import type { CctvAdapter, CctvFeed } from '../integration.types';
import type { IntegrationMode } from '../../../types/database.types';

export class MockCctvAdapter implements CctvAdapter {
  readonly mode: IntegrationMode = 'mocked';

  async getCameraFeeds(_outletId: string): Promise<CctvFeed[]> {
    return [
      { id: 'cam-1', cameraName: 'Main Dining Entrance', floorName: 'Main Dining Hall', streamUrl: 'https://placeholder.cctv/stream1.m3u8', status: 'online' },
      { id: 'cam-2', cameraName: 'Kitchen Pass Area', floorName: 'Main Dining Hall', streamUrl: 'https://placeholder.cctv/stream2.m3u8', status: 'online' },
      { id: 'cam-3', cameraName: 'Terrace Seating', floorName: 'Mezzanine & Terrace', streamUrl: 'https://placeholder.cctv/stream3.m3u8', status: 'maintenance' },
    ];
  }

  async getFeedStatus(cameraId: string): Promise<'online' | 'offline' | 'maintenance'> {
    return cameraId === 'cam-3' ? 'maintenance' : 'online';
  }
}
