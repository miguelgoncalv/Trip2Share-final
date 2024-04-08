import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, orderBy, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase-config';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import './ChatRoom.css';

function ChatRoom() {
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [receiverUserName, setReceiverUserName] = useState('');
  const [receiverUserPhoto, setReceiverUserPhoto] = useState('/user.png'); 
  const [user] = useAuthState(auth);
  const { chatId } = useParams();
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));
  const [messages] = useCollectionData(q);

  useEffect(() => {
    const fetchReceiverUserNameAndPhoto = async () => {
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);

      if (chatSnap.exists()) {
        const chatData = chatSnap.data();
        const otherUserId = chatData.userIds.find(uid => uid !== user?.uid);
        if (otherUserId) {
          const userRef = doc(db, 'users', otherUserId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setReceiverUserName(userData.displayName || 'Anonymous');
            setReceiverUserPhoto(userData.photoURL || '/user.png'); 
          }
        }
      }
    };

    if (chatId) {
      fetchReceiverUserNameAndPhoto();
    }
  }, [chatId, user?.uid]);
  
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) {
      setError('Message cannot be empty.');
      return;
    }
    if (!user) {
      setError('User is not authenticated.');
      return;
    }

    try {
      await addDoc(messagesRef, {
        text: newMessage,
        userId: user.uid,
        userName: user.displayName || 'Anonymous', 
        userPhotoURL: user.photoURL || '/default-avatar.png', 
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message: ' + err.message);
    }
  };  

  return (
    <div className="chat-container">
      {error && <p className="error">{error}</p>}
      <div className="chat-header">
        <img src={receiverUserPhoto} alt="Receiver Avatar" className="receiver-avatar" />
        <span>{receiverUserName}</span>
      </div>
      <ul className="messages-list">
        {messages && messages.map((message) => (
          <li key={message.id} className={`message ${message.userId === user?.uid ? 'sent' : 'received'}`}>
            <div className="message-content">
              <div className="message-text">{message.text}</div>
              
            </div>
          </li>
        ))}
      </ul>
      <form onSubmit={sendMessage} className="chat-form">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          aria-label="New message"
        />
        <button type="submit" aria-label="Send message">Send</button>
      </form>
    </div>
  );
}  

export default ChatRoom;