import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export default function UserDetails({ selectedEmployeeId }) {
  const socket = useRef(null);
  const videoRef = useRef(null);
  const peerConnection = useRef(null);
  const remoteStream = useRef(new MediaStream());

  const config = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  };

  const initializePeerConnection = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    peerConnection.current = new RTCPeerConnection(config);

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
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
    socket.current = io('https://qx993sw3-4000.inc1.devtunnels.ms/' );
    socket.current.emit('register-admin', selectedEmployeeId);
  
    initializePeerConnection();
  
    socket.current.on('offer', async (offer) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.current.emit('answer', selectedEmployeeId, answer);
      }
    });
  
    socket.current.on('ice-candidate', async (candidate) => {
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
  }, [selectedEmployeeId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <h1>{selectedEmployeeId}</h1>
      <button onClick={() => handleStreamSwitch('screen')}>Switch to Screen</button>
      <button onClick={() => handleStreamSwitch('webcam')}>Switch to Webcam</button>
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '400px' }} />
    </div>
  );
}
