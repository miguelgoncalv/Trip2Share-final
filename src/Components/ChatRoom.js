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
  const [user] = useAuthState(auth);
  const { chatId } = useParams();
  const messagesEndRef = useRef(null);
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));
  const [messages] = useCollectionData(q);

  useEffect(() => {
    // Scroll to the last message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    // Function to fetch the receiver's user name
    const fetchReceiverUserName = async () => {
      // You would replace this with your Firestore query to get the receiver's user name
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);
      
      if (chatSnap.exists()) {
        const chatData = chatSnap.data();
        // You need to know how to identify the receiver's user ID here to fetch their data
        // This is an example, replace it with your actual field names and logic
        const otherUserId = chatData.userIds.find(uid => uid !== user?.uid);
        if (otherUserId) {
          const userRef = doc(db, 'users', otherUserId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setReceiverUserName(userSnap.data().displayName || 'Anonymous');
          }
        }
      }
    };

    if (chatId) {
      fetchReceiverUserName();
    }
  }, [chatId, messages, user?.uid]);
  
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
        userName: user.displayName || 'Anonymous', // Fallback if displayName is not set
        userPhotoURL: user.photoURL || '/default-avatar.png', // Fallback if photoURL is not set
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message: ' + err.message);
    }
  };  

  return (
    <div className="chat-container">
      {/* Display the receiver's user name */}
      <div className="chat-header">{receiverUserName}</div>
      {error && <p className="error">{error}</p>}
      <ul className="messages-list">
         {messages?.map((message) => {
          const messageClass = message.userId === user?.uid ? 'sent' : 'received';
          return (
            <li key={message.id} className={`message ${messageClass}`}>
              {/* Removed the avatar image rendering */}
              <div className="message-content">
                <div className="message-text">{message.text}</div>
                {/* Optionally, display the sender's name for received messages */}
                {messageClass === 'received' && (
                  <div className="message-sender">{message.userName}</div>
                )}
              </div>
            </li>
          );
        })}
        <div ref={messagesEndRef} />
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
