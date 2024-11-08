import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export default function UserDetails({selectedEmployeeId}) {
  const socket = useRef(null);
  const videoRef = useRef(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const remoteStream = useRef(new MediaStream());
 
  const config = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  };

  useEffect(() => {
    socket.current = io('http://192.168.6.28:4000'); // Adjust if needed
    socket.current.emit('register-admin', 'admin');
    socket.current.on('offer', async (offer) => {
      const pc = new RTCPeerConnection(config);
      setPeerConnection(pc);
  
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.current.emit('ice-candidate', selectedEmployeeId, event.candidate);
        }
      };
  
      pc.ontrack = (event) => {
        // Add the received stream to the remote stream and display it
        event.streams[0].getTracks().forEach((track) => remoteStream.current.addTrack(track));
        videoRef.current.srcObject = remoteStream.current;
        console.log('video',remoteStream.current)
      };
  
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer)); // Set the offer
        const answer = await pc.createAnswer(); // Create the answer
        await pc.setLocalDescription(answer); // Set the answer locally
        socket.current.emit('answer', selectedEmployeeId, answer); // Send answer to employee
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    });
  
    socket.current.on('ice-candidate', async (candidate) => {
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
      if (peerConnection) {
        peerConnection.close();
      }
    };
  }, [peerConnection, selectedEmployeeId]);
  
  

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <h1>Admin - Live Video Stream-{selectedEmployeeId}</h1>
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '400px', border: '1px solid gray' }} />
    </div>
  );
}
