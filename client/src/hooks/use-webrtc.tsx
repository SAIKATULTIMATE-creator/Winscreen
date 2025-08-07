import { useRef, useState, useCallback } from 'react';

interface WebRTCOptions {
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
}

interface ScreenShareOptions {
  includeAudio?: boolean;
  video?: {
    width: number;
    height: number;
    frameRate: number;
  };
}

export function useWebRTC({ onIceCandidate }: WebRTCOptions = {}) {
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const createPeerConnection = useCallback(() => {
    if (peerConnection.current) {
      return peerConnection.current;
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && onIceCandidate) {
        onIceCandidate(event.candidate);
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    peerConnection.current = pc;
    return pc;
  }, [onIceCandidate]);

  const startScreenShare = useCallback(async (options: ScreenShareOptions = {}) => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: options.video?.width || 1920,
          height: options.video?.height || 1080,
          frameRate: options.video?.frameRate || 30,
        },
        audio: options.includeAudio || false,
      });

      setLocalStream(stream);

      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      return stream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }, [createPeerConnection]);

  const stopScreenShare = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    setRemoteStream(null);
  }, [localStream]);

  const createOffer = useCallback(async (stream?: MediaStream) => {
    const pc = createPeerConnection();

    if (stream) {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    }

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }, [createPeerConnection]);

  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    const pc = createPeerConnection();

    try {
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error('Error handling offer:', error);
      throw error;
    }
  }, [createPeerConnection]);

  const createAnswer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    return handleOffer(offer);
  }, [handleOffer]);

  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    if (peerConnection.current) {
      try {
        await peerConnection.current.setRemoteDescription(answer);
      } catch (error) {
        console.error('Error handling answer:', error);
        throw error;
      }
    }
  }, []);

  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (peerConnection.current) {
      try {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    }
  }, []);

  return {
    localStream,
    remoteStream,
    startScreenShare,
    stopScreenShare,
    createOffer,
    handleOffer,
    createAnswer,
    handleAnswer,
    handleIceCandidate,
    peerConnection: peerConnection.current,
  };
}
