import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  doc,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../firebase-config';
import './ChatList.css';


function ChatList() {
  const [chatsInfo, setChatsInfo] = useState([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const fetchChatsInfo = async () => {
      if (!user) return;
      const chats = [];
      const userChatsRef = collection(db, "chats");
      const q = query(userChatsRef, where("userIds", "array-contains", user.uid));
      const querySnapshot = await getDocs(q);
    
      for (let docSnapshot of querySnapshot.docs) {
        const lastMessageQuery = query(
          collection(db, "chats", docSnapshot.id, "messages"),
          orderBy("timestamp", "desc"),
          limit(1)
        );
        const lastMessageSnapshot = await getDocs(lastMessageQuery);
        const lastMessageData = lastMessageSnapshot.docs.length
          ? lastMessageSnapshot.docs[0].data()
          : { text: "No messages yet.", timestamp: null };
    
        const otherUserId = docSnapshot.data().userIds.find(uid => uid !== user.uid);
        const otherUserDocRef = doc(db, "users", otherUserId); // Ensure 'doc' is called correctly
        const otherUserSnap = await getDoc(otherUserDocRef);
        const otherUserData = otherUserSnap.exists() ? otherUserSnap.data() : {};
    
        chats.push({
          id: docSnapshot.id,
          otherUserName: otherUserData.displayName || "Anonymous",
          otherUserPhotoURL: otherUserData.photoURL || "/default-avatar.png",
          lastMessage: lastMessageData.text,
          timestamp: lastMessageData.timestamp ? lastMessageData.timestamp.toDate().toLocaleString() : "N/A",
        });
      }
    
      setChatsInfo(chats);
    };
    
  
    fetchChatsInfo();
  }, [user]);
  
  
  return (
    <div className="chat-list-container-background">
    <div className="chat-list-container">
    <h2 className="chat-list-title">My Chats</h2>
    {chatsInfo.map((chat) => (
      <Link to={`/chatroom/${chat.id}`} className="chat-item" key={chat.id}>
        <img src={chat.otherUserPhotoURL} alt={`${chat.otherUserName}'s avatar`} className="chat-item-avatar" />
        <div className="chat-item-details">
          <span className="chat-item-title">{chat.otherUserName}</span>
          <span className="chat-item-last-message">{chat.lastMessage}</span>
          <span className="chat-item-timestamp">{chat.timestamp}</span>
        </div>
      </Link>
    ))}
  </div>
</div>
  

  );
}

export default ChatList;