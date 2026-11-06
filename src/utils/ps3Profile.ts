/**
 * PS3 Hardware Profile & Jellyfin Stream Compatibility Engine
 * Optimized for Custom Firmware (CFW) & PS3HEN 4.89, 4.90, 4.91, 4.92, 4.93
 */

export type PS3FirmwareVersion = '4.89' | '4.90' | '4.91' | '4.92' | '4.93';

export interface PS3SystemStatus {
  firmware: PS3FirmwareVersion;
  henActive: boolean;
  henVersion: string;
  cellTemp: number; // °C
  rsxTemp: number;  // °C
  fanSpeed: number; // %
  freeRamMb: number;
  totalRamMb: number;
  isWebmanConnected: boolean;
  ipAddress: string;
}

export interface JellyfinDeviceProfile {
  name: string;
  id: string;
  maxStreamingBitrate: number;
  maxVideoWidth: number;
  maxVideoHeight: number;
  directPlayProfiles: {
    container: string;
    type: 'Video' | 'Audio';
    videoCodec: string;
    audioCodec: string;
  }[];
  transcodingProfiles: {
    container: string;
    type: 'Video';
    videoCodec: string;
    audioCodec: string;
    protocol: string;
    estimateContentLength: boolean;
    enableMpegtsM2TsMode: boolean;
    transcodingSubProtocol: string;
    context: string;
    maxAudioChannels: string;
    minSegments: string;
    segmentLength: string;
  }[];
  subtitleProfiles: {
    format: string;
    method: 'External' | 'Embed' | 'Encode';
  }[];
}

/**
 * Generates the official Jellyfin client device profile tailored specifically
 * for the PlayStation 3 Cell Broadband Engine & RSX Reality Synthesizer hardware video decoder.
 */
export function getPs3DeviceProfile(firmware: PS3FirmwareVersion = '4.93'): JellyfinDeviceProfile {
  return {
    name: `PlayStation 3 (HEN ${firmware} AVC/1080p Profile)`,
    id: `ps3-hen-${firmware.replace('.', '')}-avc`,
    maxStreamingBitrate: 35000000, // 35 Mbps (smooth over PS3 100Mbit LAN or 802.11g WiFi)
    maxVideoWidth: 1920,
    maxVideoHeight: 1080,
    directPlayProfiles: [
      {
        container: 'mp4,m4v,mov',
        type: 'Video',
        videoCodec: 'h264',
        audioCodec: 'aac,mp3,ac3'
      },
      {
        container: 'mkv',
        type: 'Video',
        videoCodec: 'h264',
        audioCodec: 'aac,mp3,ac3'
      },
      {
        container: 'mp3,aac,flac,wav,m4a',
        type: 'Audio',
        videoCodec: '',
        audioCodec: 'mp3,aac,flac,wav'
      }
    ],
    transcodingProfiles: [
      {
        container: 'ts',
        type: 'Video',
        videoCodec: 'h264',
        audioCodec: 'aac,ac3',
        protocol: 'hls',
        estimateContentLength: false,
        enableMpegtsM2TsMode: false,
        transcodingSubProtocol: 'hls',
        context: 'Streaming',
        maxAudioChannels: '6', // Up to 5.1 AC3 surround
        minSegments: '2',
        segmentLength: '3'
      }
    ],
    subtitleProfiles: [
      { format: 'srt', method: 'External' },
      { format: 'vtt', method: 'External' },
      { format: 'subrip', method: 'External' },
      { format: 'ass', method: 'External' }, // We strip & render client-side!
      { format: 'ssa', method: 'External' },
      { format: 'pgssub', method: 'External' } // PGS graphic overlay
    ]
  };
}

/**
 * Generates the optimal stream URL parameters for Jellyfin video playback
 */
export function buildJellyfinStreamUrl(params: {
  serverUrl: string;
  itemId: string;
  mediaSourceId?: string;
  audioStreamIndex?: number;
  subtitleStreamIndex?: number;
  playMethod: 'DirectPlay' | 'DirectStream' | 'Transcode';
  maxBitrate?: number;
}): string {
  const base = params.serverUrl.replace(/\/+$/, '');
  const url = new URL(`${base}/Videos/${params.itemId}/stream.mp4`);

  url.searchParams.set('Static', params.playMethod === 'DirectPlay' ? 'true' : 'false');
  url.searchParams.set('DeviceId', 'ps3-hen-media-client');
  url.searchParams.set('VideoCodec', 'h264');
  url.searchParams.set('AudioCodec', 'aac,ac3');
  url.searchParams.set('MaxWidth', '1920');
  url.searchParams.set('MaxHeight', '1080');
  url.searchParams.set('VideoBitrate', (params.maxBitrate || 25000000).toString());

  if (params.audioStreamIndex !== undefined) {
    url.searchParams.set('AudioStreamIndex', params.audioStreamIndex.toString());
  }

  if (params.subtitleStreamIndex !== undefined && params.subtitleStreamIndex >= 0) {
    url.searchParams.set('SubtitleStreamIndex', params.subtitleStreamIndex.toString());
  }

  return url.toString();
}

/**
 * Default mock PS3 system status for initial boot & testing
 */
export function createDefaultPs3Status(firmware: PS3FirmwareVersion = '4.93'): PS3SystemStatus {
  return {
    firmware,
    henActive: true,
    henVersion: '3.3.0',
    cellTemp: 64, // Cell BE normal operating temp 62-68C
    rsxTemp: 58,  // RSX normal operating temp 55-63C
    fanSpeed: 32, // Syscon or webMAN dynamic fan %
    freeRamMb: 184,
    totalRamMb: 256,
    isWebmanConnected: true,
    ipAddress: '192.168.1.150'
  };
}

/**
 * Generates PS3 XMB PKG Installer manifest and configuration
 */
export function generatePs3PkgManifest(appUrl: string, firmware: PS3FirmwareVersion) {
  return {
    titleId: 'JELLY0001',
    contentId: 'UP0001-JELLY0001_00-0000000000000000',
    title: 'Jellyfin PS3 Client',
    version: '1.2.0',
    targetFirmware: firmware,
    minFirmware: '4.89',
    hfwCompatible: true,
    henTested: ['4.89', '4.90', '4.91', '4.92', '4.93'],
    category: 'HG', // Homebrew Game / App
    resolution: '1080p (1920x1080)',
    appUrl,
    installPath: '/dev_hdd0/game/JELLY0001/USRDIR/',
    webmanBookmark: `http://localhost/browser.ps3$${appUrl}`,
    instructions: [
      '1. Enable HEN on your PS3 XMB (Firmware 4.89 to 4.93).',
      '2. Copy JELLY0001.pkg to root of FAT32 USB drive or FTP to /dev_hdd0/packages/.',
      '3. In XMB, go to Package Manager -> Install Package Files -> Standard.',
      '4. Select Jellyfin PS3 and press (X) to install.',
      '5. Launch directly from TV/Video Services or Game column on XMB!'
    ]
  };
}
