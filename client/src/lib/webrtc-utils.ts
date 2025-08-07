export const getRTCConfiguration = (): RTCConfiguration => {
  return {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
    iceCandidatePoolSize: 10,
  };
};

export const getDisplayMediaConstraints = (
  includeAudio: boolean = false,
  quality: 'low' | 'medium' | 'high' = 'high'
): DisplayMediaStreamConstraints => {
  const videoConstraints = {
    low: { width: 640, height: 480, frameRate: 15 },
    medium: { width: 1280, height: 720, frameRate: 24 },
    high: { width: 1920, height: 1080, frameRate: 30 },
  };

  return {
    video: {
      ...videoConstraints[quality],
      cursor: 'always' as const,
    },
    audio: includeAudio,
  };
};

export const handleWebRTCError = (error: unknown): string => {
  if (error instanceof Error) {
    switch (error.name) {
      case 'NotAllowedError':
        return 'Screen sharing permission denied. Please allow access and try again.';
      case 'NotFoundError':
        return 'No screen capture source available.';
      case 'AbortError':
        return 'Screen sharing was aborted.';
      case 'NotReadableError':
        return 'Unable to access screen capture. Please try again.';
      case 'OverconstrainedError':
        return 'Screen capture constraints could not be satisfied.';
      case 'SecurityError':
        return 'Screen sharing is not allowed in this context.';
      default:
        return `Screen sharing error: ${error.message}`;
    }
  }
  return 'Unknown screen sharing error occurred.';
};

export const generateDeviceId = (): string => {
  return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatLatency = (ms: number): string => {
  if (ms < 50) return 'Excellent';
  if (ms < 100) return 'Good';
  if (ms < 200) return 'Fair';
  return 'Poor';
};

export const getConnectionQualityFromStats = (stats: RTCStatsReport): {
  bitrate: number;
  packetLoss: number;
  latency: number;
} => {
  let bitrate = 0;
  let packetLoss = 0;
  let latency = 0;

  stats.forEach((report) => {
    if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
      bitrate = report.bytesReceived || 0;
    }
    if (report.type === 'candidate-pair' && report.state === 'succeeded') {
      latency = report.currentRoundTripTime || 0;
    }
  });

  return { bitrate, packetLoss, latency };
};
