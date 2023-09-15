import { Close as CloseIcon } from '@mui/icons-material';
import {
    Button,
    IconButton,
    Modal,
    Paper,
    Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/system';
import axios from 'axios';
import Lottie from "lottie-react";
import React, { useState } from 'react';
import VideoForm from './VideoForm';
import rocket from './rocket.json';


const UploadModalContainer = styled(Paper)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: theme.spacing(2),
    width: '90%', // Set the width to 70% for big screen sizes
    height: '90%', // Set the height to 90% for big screen sizes
    maxWidth: 1000, // Set the maximum width to 600px
    textAlign: 'center',
    bgcolor: 'gray', // Set the background color to gray
    [theme.breakpoints.down('sm')]: {
        // Make the modal responsive for small screen sizes
        width: '90%',
    },
    '&:focus': {
        outline: 'none',
    },
    '&:hover': {
        cursor: 'pointer',
    },
}));

const CloseIconButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
}));

const UploadButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    width: '100%',
}));

export const UploadModal = ({ open, onClose }) => {
    const [uploading, setUploading] = useState(false); // State to track if upload is in progress
    const [showForm, setShowForm] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const theme = useTheme();
    // Inside your component
    const handleFileSelect = async (event) => {
        const selectedFile = event.target.files[0];
        console.log('selectedFile', selectedFile);
        if (selectedFile) {
            try {
                const formData = new FormData();
                formData.append('title', 'My video title');
                formData.append('video', selectedFile);
                setUploading(true); // Start the rocket animation

                const response = await axios.post(
                    "http://127.0.0.1:5000/api/v1/videos/upload",
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            Accept: "*/*",
                        },
                    }

                );
                setAlertType("success");
                console.log(response);
                if (response.status === 200) {
                    // Handle successful upload
                    console.log('Upload successful');
                    setUploading(false); // Stop the rocket animation
                    // Show the form after a delay (1 second)
                } else {
                    // Handle upload error
                    console.error('Upload failed');
                }
            } catch (error) {
                console.error('Upload error:', error);
            }
        }
    };

    const defaultOptions = {
        loop: false,
        autoplay: true,

    };

    const handleAnimationComplete = () => {
        onClose();
        setShowForm(true);
        console.log('Animation completed');
    }

    return (
        <>
            <Modal open={open}>
                <UploadModalContainer elevation={3}>
                    <CloseIconButton onClick={onClose}>
                        <CloseIcon />
                    </CloseIconButton>
                    <Typography variant="h6">Upload Video</Typography>
                    <Typography variant="body1" component="p">
                        Drag and drop video files to upload
                    </Typography>
                    <Typography variant="body2" component="p">
                        Your videos will be private until you publish them.
                    </Typography>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '20px',
                        }}
                    >
                        {uploading ? (
                            <div>
                                {/* Display rocket animation or loading indicator here */}
                                <Typography variant="body2" component="div">
                                    <div style={{ height: 300, width: 300 }}>
                                        Uploading...
                                        <Lottie
                                            animationData={rocket}
                                            onAnimationEnd={() => console.log('Animation End!')}
                                            onComplete={handleAnimationComplete}
                                            loop={false} // Set to true for the animation to repeat
                                            speed={2.5} // Set the speed of the animation
                                            segments={[0, 20]} // Set the start and end frames of the animation
                                        />
                                    </div> {/* Replace with your animation component */}
                                </Typography>
                            </div>
                        ) : (
                            <div>
                                <input
                                    type="file"
                                    id="fileInput"
                                    style={{ display: 'none' }}
                                    onChange={handleFileSelect}
                                    accept="video/*"
                                />

                                <label htmlFor="fileInput">
                                    <div
                                        style={{
                                            marginTop: theme.spacing(2),
                                            marginBottom: theme.spacing(2),
                                            width: '100%',
                                            // Add any other custom styles you want here
                                            backgroundColor: 'blue',
                                            color: 'white',
                                            padding: '10px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Select File
                                    </div>
                                </label>
                            </div>
                        )}

                    </div>
                    <Typography variant="body2" component="p">
                        By submitting your videos to YouTube, you acknowledge that you agree
                        to YouTube's{' '}
                        <a
                            href="https://www.youtube.com/t/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a
                            href="https://www.youtube.com/yt/about/policies/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Community Guidelines
                        </a>
                        .
                    </Typography>
                    <Typography variant="body2" component="p">
                        Please be sure not to violate others' copyright or privacy rights.{' '}
                        <a
                            href="https://www.youtube.com/yt/copyright"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Learn more
                        </a>
                    </Typography>
                </UploadModalContainer>
            </Modal>
            {
                showForm && <VideoForm />
            }
        </>
    );
};