import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, getDoc, getDocs,   deleteDoc, } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useAuth } from '../Contexts/AuthContext';
import './TripFeed.css';
import { useNavigate } from 'react-router-dom';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

function TripFeed() {
    const [trips, setTrips] = useState([]);
    const [comments, setComments] = useState({});
    const [newCommentText, setNewCommentText] = useState({});
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    

    useEffect(() => {
        // Fetch trips and listen for real-time updates
        const unsubscribeTrips = onSnapshot(collection(db, "trips"), async (snapshot) => {
            const tripsData = [];
            for (const doc of snapshot.docs) {
                const tripData = { ...doc.data(), id: doc.id };
                // Attempt to fetch the user's profile picture
                const storage = getStorage();
                try {
                    const profilePicPath = `profiles/${tripData.userId}/profilePic`; 
                    const profilePicRef = ref(storage, profilePicPath);
                    tripData.userPhotoURL = await getDownloadURL(profilePicRef);
                } catch (error) {
                    console.error("Failed to load user photo", error);
                    tripData.userPhotoURL = './Images/default-avatar.png'; 
                }
                tripsData.push(tripData);
            }
            setTrips(tripsData);
        });

        return () => unsubscribeTrips(); 
    }, []);

    useEffect(() => {
        // Reach all the  comments for each trip and listen for real-time updates...
        trips.forEach((trip) => {
            const unsubscribe = onSnapshot(query(collection(db, "comments"), where("tripId", "==", trip.id)), (snapshot) => {
                const commentsData = snapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id,
                }));
                setComments(prevComments => ({
                    ...prevComments,
                    [trip.id]: commentsData,
                }));
            });

            return () => unsubscribe();
        });
    }, [trips]);


    const handleAddComment = async (tripId) => {
        if (!newCommentText[tripId] || !currentUser) return;

        await addDoc(collection(db, "comments"), {
            tripId,
            text: newCommentText[tripId],
            userId: currentUser.uid,
            createdAt: serverTimestamp(),
        });
        setNewCommentText(prev => ({ ...prev, [tripId]: '' }));
    };


    const handlePrivateMessage = async (tripUserId) => {
        if (!currentUser) {
            console.log("User not logged in");
            return;
          }
        
          try {
            const chatId = await findOrCreateChat(currentUser.uid, tripUserId);
            navigate(`/chatroom/${chatId}`);
          } catch (error) {
            console.error("Failed to find or create chat:", error);
          }
        };


    const handleNewCommentChange = (tripId, text) => {
        setNewCommentText({ ...newCommentText, [tripId]: text });
    };

    const handleDeleteComment = async (tripId, commentId) => {
      // Check if a user is logged in or not...
      if (currentUser) {
        try {
          await deleteDoc(doc(db, "comments", commentId));
          setComments(prevComments => ({
            ...prevComments,
            [tripId]: prevComments[tripId].filter(comment => comment.id !== commentId),
          }));
        } catch (error) {
          console.error("Error deleting comment:", error);
        }
      }
    };

const fetchUserDetails = async (userId) => {
    if (!userId) return { userName: 'Anonymous', userPhotoURL: './Images/default-avatar.png' };
  
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) return { userName: 'Anonymous', userPhotoURL: './Images/default-avatar.png' };
  
      const userData = userDocSnap.data();
      const userName = userData.displayName || 'Anonymous';
      const userPhotoURL = userData.photoURL || './Images/default-avatar.png';
      return { userName, userPhotoURL };
    } catch (error) {
      console.error("Error fetching user details:", error);
      return { userName: 'Anonymous', userPhotoURL: './Images/default-avatar.png' };
    }
  };
  
  useEffect(() => {

    const unsubscribeComments = trips.map(trip => {
      return onSnapshot(query(collection(db, "comments"), where("tripId", "==", trip.id)), async (snapshot) => {
        const commentsDataPromises = snapshot.docs.map(async (doc) => {
          const commentData = doc.data();
          const { userName, userPhotoURL } = await fetchUserDetails(commentData.userId);
          return { ...commentData, id: doc.id, userName, userPhotoURL };
        });
  
        const commentsData = await Promise.all(commentsDataPromises);
        setComments(prevComments => ({
          ...prevComments,
          [trip.id]: commentsData,
        }));
      });
    });
  
    return () => unsubscribeComments.forEach(unsub => unsub());
  }, [trips]);
  
  const findOrCreateChat = async (currentUserId, otherUserId) => {
   
    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("userIds", "array-contains", currentUserId));
  
    const querySnapshot = await getDocs(q);
    let chatDoc = querySnapshot.docs.find(doc => doc.data().userIds.includes(otherUserId));
  
    if (chatDoc) {
      // Chat already exists...
      return chatDoc.id;
    } else {
      // Create a new chat document with both user IDs for a new chat
      const chatData = {
        userIds: [currentUserId, otherUserId],
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(chatsRef, chatData);
      return docRef.id; 
    }
  };
  

  

     return (
        <div className="trip-feed-container">
                        <h2 className="trip-feed-title">Join Adventures</h2>
            {trips.map((trip) => (
                <div key={trip.id} className="trip-entry">
                    <div className="trip-header">
                        <img src={trip.userPhotoURL} alt={trip.name} className="trip-user-photo"/>
                        <p className="trip-name">{trip.name}</p>
                    </div>
                    <div className="trip-body">
                        <h3 className="trip-destination">{trip.destination}</h3>
                        <p className="trip-date">{trip.date}</p>
                        <p className="trip-description">{trip.description}</p>
                        
                        {/* Comments Section */}
                        <div className="comments-section">
  {comments[trip.id] && comments[trip.id].map((comment, index) => (
                  <div key={index} className="comment">
                    <img src={comment.userPhotoURL} alt="User" className="comment-user-photo" />
                    <p><strong>{comment.userName}:</strong> {comment.text}</p>
                    {currentUser && currentUser.uid === comment.userId && (
                      <button
                        onClick={() => handleDeleteComment(trip.id, comment.id)}
                        className="delete-comment-button" 
                      >
                        Delete
                      </button>
                    )}
    </div>
  ))} 
                            <input
                                type="text"
                                placeholder="Write a comment..."
                                value={newCommentText[trip.id] || ''}
                                onChange={(e) => handleNewCommentChange(trip.id, e.target.value)}
                            />
                            <button onClick={() => handleAddComment(trip.id)}>Comment</button>
                            {/* Button for sending private messages */}
                            <button onClick={() => handlePrivateMessage(trip.userId)} style={{marginLeft: "10px"}}>Send Private Message</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
export default TripFeed;