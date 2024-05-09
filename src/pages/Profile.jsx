import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export default function Profile() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [tempUsername, setTempUsername] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePictureURL, setProfilePictureURL] = useState('');

    useEffect(() => {
      fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                const q = query(collection(db, "users"), where("uid", "==", user.uid));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                    const userData = doc.data();
                    setUsername(userData.username);
                    setEmail(userData.email);
                    setTempUsername(userData.username); 
                    setProfilePictureURL(userData.profilePicture || '');
                });
            } else {
                console.error('User not authenticated');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };
    const handleProfilePictureChange = (e) => {
        // Get the selected file from the input
        const file = e.target.files[0];
        setProfilePicture(file);
    };
    
    const uploadProfilePicture = async () => {
        try {
            const user = auth.currentUser;
            if (user && profilePicture) {
                const storageRef = ref(storage, `profilePictures/${user.uid}`);
                const uploadTask = uploadBytesResumable(storageRef, profilePicture);
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        // Handle progress if needed
                    },
                    (error) => {
                        console.error('Error uploading profile picture:', error);
                        toast.error('Error uploading profile picture');
                    },
                    () => {
                        getDownloadURL(storageRef).then((downloadURL) => {
                            // Update profile picture URL state
                            setProfilePictureURL(downloadURL);
                            // Update the user document with the profile picture URL
                            const q = query(collection(db, "users"), where("uid", "==", user.uid));
                            getDocs(q).then((querySnapshot) => {
                                if (!querySnapshot.empty) {
                                    const docRef = querySnapshot.docs[0].ref;
                                    const updatedData = { profilePicture: downloadURL };
                                    updateDoc(docRef, updatedData).then(() => {
                                        console.log('Profile picture updated successfully!');
                                        toast.success('Profile picture updated successfully!');
                                    }).catch((error) => {
                                        console.error('Error updating user document:', error);
                                        toast.error('Error updating user document');
                                    });
                                } else {
                                    console.error('User document not found');
                                    toast.error('User document not found');
                                }
                            }).catch((error) => {
                                console.error('Error fetching user document:', error);
                                toast.error('Error fetching user document');
                            });
                        }).catch((error) => {
                            console.error('Error getting download URL:', error);
                            toast.error('Error getting download URL');
                        });
                    }
                );
            }
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            toast.error('Error uploading profile picture');
        }
    };
    

    const handleSaveUsername = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                const q = query(collection(db, "users"), where("uid", "==", user.uid));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const docRef = querySnapshot.docs[0].ref;
                    const updatedData = { username: tempUsername };
                    // Update the document with the updated data
                    await updateDoc(docRef, updatedData);
                    setUsername(tempUsername);
                    console.log('Username updated successfully!');
                    toast.success('Username updated successfully!');
                } else {
                    throw new Error('User document not found');
                }
            } catch (error) {
                console.error('Error updating username:', error);
                toast.error(error.message); 
            }
        }
    };

    const handleUsernameChange = (e) => {
      if (e.target.value.includes(' ')) {
        toast.error('Username cannot contain spaces');
        return;
      }
      setTempUsername(e.target.value); 
    };
    
    return (
        <div className="container mx-auto mt-8">
          <ToastContainer />
          <h1 className="text-3xl font-bold mb-4">Profile</h1>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="mb-4 flex flex-col items-center">
              <label className="block text-sm font-semibold mb-2 text-left w-full">Profile Picture:</label>
              <div className="relative w-20 h-20 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 flex justify-center items-center">
                {profilePictureURL ? (
                  <img src={profilePictureURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                  </svg>
                )}
              </div>
              <input type="file" onChange={handleProfilePictureChange} accept="image/*" className="border border-gray-300 rounded-md p-2 w-full mt-2 mx-auto" />
              <div className="flex justify-end mt-2 text-right w-full">
                <button onClick={uploadProfilePicture} className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-md">
                  Upload Profile Picture
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Email:</label>
              <input type="text" value={email} disabled className="border border-gray-300 rounded-md p-2 w-full" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Username:</label>
              <input type="text" value={tempUsername} onChange={handleUsernameChange} className="border border-gray-300 rounded-md p-2 w-full" />
              <div className="flex justify-end mt-2">
                <button onClick={handleSaveUsername} className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-md">
                  Save Username
                </button>
              </div>
            </div>
            {/* Add the provided button */}
            <div className="absolute top-0 left-0 mt-4 ml-4 flex items-center">
              <Link to="/homepage">
                <button className="w-8 h-8 flex items-center justify-center bg-pink-500 hover:bg-pink-700 text-white font-bold rounded-full">
                  <svg className="w-4 h-4 rtl:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </div>
      );

    }