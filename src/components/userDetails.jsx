import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export default function UserDetails({ selectedEmployeeId }) {
  const socket = useRef(null);
  const videoRef = useRef(null);
  const peerConnection = useRef(null);
  const remoteStream = useRef(new MediaStream());
  const rtcConfig= useRef({ iceServers: [] });
  const [isConfigReady, setIsConfigReady] = useState(false);

  useEffect(() => {
    const fetchIceServers = async () => {
      try {
        const response  = await fetch(
          'https://qx993sw3-5000.inc1.devtunnels.ms/ice-servers',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        const data = await response.json();
        rtcConfig.current=({ iceServers: data.token.iceServers });
        setIsConfigReady(true)
      } catch (error) {
        console.error('Failed to fetch ICE servers:', error);
      }
    };

    fetchIceServers();
  }, []);
  // const config = {
  //   iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  // };

  const initializePeerConnection = () => {
    if (!isConfigReady) {
      console.error('ICE server configuration not ready');
      return;
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    if (!rtcConfig) {
    console.error('ICE server configuration not ready');
    return;
    }
    console.log("new",rtcConfig?.current)
    peerConnection.current = new RTCPeerConnection(rtcConfig.current);

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('candidate',event.candidate)
        socket.current.emit('ice-candidate', selectedEmployeeId, event.candidate);
      }
    };

    peerConnection.current.ontrack = (event) => {
      remoteStream.current.addTrack(event.track);
      videoRef.current.srcObject = remoteStream.current;
    };

    remoteStream.current = new MediaStream();
    videoRef.current.srcObject = remoteStream.current;
  };

  const handleStreamSwitch = (type) => {
    socket.current.emit('switch-stream', type);
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.disconnect();
    }
    socket.current = io('https://qx993sw3-5000.inc1.devtunnels.ms/' );
    socket.current.emit('register-admin', selectedEmployeeId);
  
    if (isConfigReady) {
      initializePeerConnection();
    }

  
    socket.current.on('offer', async (offer) => {
      console.log("signalstate",peerConnection.current.signalingState )
      if (peerConnection.current.signalingState !== 'stable') {
        console.error('PeerConnection is not in a stable state');
        return;
      }
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.current.emit('answer', selectedEmployeeId, answer);
      }
    });
  
    socket.current.on('ice-candidate', async (candidate) => {
      console.log("icecandidate",candidate)
      if (candidate && peerConnection.current) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
  
    socket.current.on('stream-paused', () => {
      console.log('Stream paused');
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    });
  
    socket.current.on('stream-resumed', () => {
      console.log('Stream resumed');
      videoRef.current.srcObject = remoteStream.current;
    });
  
    return () => {
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [selectedEmployeeId,isConfigReady]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <h1>{selectedEmployeeId}</h1>
      <button onClick={() => handleStreamSwitch('screen')}>Switch to Screen</button>
      <button onClick={() => handleStreamSwitch('webcam')}>Switch to Webcam</button>
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '400px' }} />
    </div>
  );
}
