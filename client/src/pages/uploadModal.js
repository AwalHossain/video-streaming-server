import { Close as CloseIcon } from '@mui/icons-material';
import {
    Button,
    IconButton,
    Modal,
    Paper,
    Typography,
} from '@mui/material';
import { styled } from '@mui/system';
import axios from 'axios';
import { useFormik } from 'formik';
import React, { useState } from 'react';

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
    const [alertType, setAlertType] = useState('success');

    const postToServer = async (values) => {
        const { title } = values;
        const videoFile = values.videoFile;
        const formData = new FormData();
        formData.append('title', title);
        formData.append('video', videoFile);
        try {
            const response = await axios.post(
                'http://127.0.0.1:5000/api/v1/videos/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Accept: '*/*',
                    },
                }
            );
            setAlertType('success');
            console.log(response);
        } catch (error) {
            console.log(error);
            setAlertType('error');
        }
    };

    const formik = useFormik({
        initialValues: {
            title: '',
            videoFile: null,
        },
        onSubmit: async (values) => {
            await postToServer(values);
        },
        validate: (values) => {
            const errors = {};
            if (!values.videoFile) {
                errors.videoFile = 'Video file is required';
            }
            // check videoFile type, must be video/mp4 or video/x-matroska
            if (
                values.videoFile?.type !== 'video/mp4' &&
                values.videoFile?.type !== 'video/webm'
            ) {
                errors.videoFile = 'Video file type should be .mp4 or .webm';
            }

            return errors;
        },
    });

    return (
        <Modal open={open} onClose={onClose}>
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
                    <UploadButton variant="contained" color="primary">
                        <form onSubmit={formik.handleSubmit}>
                            <label htmlFor="videoFile">
                                <input
                                    id="videoFile"
                                    name="videoFile"
                                    type="file"
                                    onChange={(event) => {
                                        formik.setFieldValue(
                                            'videoFile',
                                            event.currentTarget.files[0]
                                        );
                                    }}
                                    style={{ display: 'none' }}
                                />
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    component="span"
                                >
                                    Upload video
                                </Button>
                            </label>
                            <Typography variant="body2" component="p">
                                {formik.values.videoFile?.name}
                            </Typography>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={!formik.isValid || formik.isSubmitting}
                            >
                                Upload
                            </Button>
                        </form>
                    </UploadButton>
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
    );
};