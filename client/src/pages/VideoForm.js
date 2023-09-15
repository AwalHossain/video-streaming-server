import { Close as CloseIcon } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
    Button,
    FormControl,
    IconButton,
    Modal,
    Paper,
    Stack,
    TextField
} from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { styled } from '@mui/system';
import React, { useState } from 'react';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useFormik } from 'formik';
import * as yup from 'yup';


const StyledContent = styled('div')(({ theme }) => ({
    maxWidth: 600,
    margin: 'auto',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'left',
    flexDirection: 'column',
    padding: theme.spacing(12, 0),
}));

/**
 *  Create a MUI form to save below video properties: 
    title, description, visibility, 
    thumbnailUrl, language, recordingDate, 
    category,
 */

const validationSchema = yup.object({
    title: yup.string().required('Title is required'),
    description: yup.string().required('Description is required'),
    visibility: yup.string().required('Visibility is required'),
    thumbnailUrl: yup.string().required('Thumbnail URL is required'),
    language: yup.string().required('Language is required'),
    recordingDate: yup.date().required('Recording date is required'),
    category: yup.string().required('Category is required'),
});


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


const VideoForm = () => {

    const [open, setOpen] = useState(true);

    const handleClose = () => {
        setOpen(false);
    };

    const formik = useFormik({
        initialErrors: {
            videoFile: 'Video file is required',
        },
        initialValues: {
            title: 'title1',
            description: 'desc',
            visibility: 'public',
            thumbnailUrl: 'test',
            language: 'Bangla',
            recordingDate: new Date(),
            category: 'Education',
            videoFile: null,
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            // await postToServer(values);
        },
        validate: (values) => {
            const errors = {};
            if (!values.videoFile) {
                errors.videoFile = 'Video file is required';
            }
            // check videoFile size
            if (values.videoFile?.size > 52428000) {
                errors.videoFile = 'Video file size should be less than 50MB';
            }
            console.log(values.videoFile?.type);
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
        <>
            <Modal open={open}>
                <UploadModalContainer elevation={3}>
                    <CloseIconButton onClick={handleClose}>
                        <CloseIcon />
                    </CloseIconButton>
                    <form onSubmit={formik.handleSubmit}>
                        <Stack spacing={3}>
                            <label htmlFor='video'>
                                <input
                                    style={{ display: 'none' }}
                                    name='video'
                                    accept='video/*'
                                    id='video'
                                    type='file'
                                    onChange={(e) => {
                                        const file = e.currentTarget.files[0];
                                        formik.setFieldValue('videoFile', file);
                                    }}
                                />
                                <Button
                                    color='secondary'
                                    variant='contained'
                                    component='span'
                                >
                                    Upload video
                                </Button>
                            </label>
                            {/* video file name display here */}
                            <TextField
                                value={formik.values.videoFile?.name}
                                error={Boolean(formik.errors?.videoFile)}
                                helperText={formik.errors?.videoFile}
                            />
                            <TextField
                                id='title'
                                name='title'
                                label='Video title'
                                value={formik.values.title}
                                onChange={formik.handleChange}
                                error={formik.touched.title && Boolean(formik.errors.title)}
                                helperText={formik.touched.title && formik.errors.title}
                            />
                            <TextField
                                id='description'
                                name='description'
                                label='Video description'
                                value={formik.values.description}
                                onChange={formik.handleChange}
                                error={
                                    formik.touched.description &&
                                    Boolean(formik.errors.description)
                                }
                                helperText={
                                    formik.touched.description && formik.errors.description
                                }
                            />
                            <FormControl fullWidth>
                                <InputLabel id='visibility-select-label'>
                                    Visibility
                                </InputLabel>
                                <Select
                                    labelId='visibility-select-label'
                                    id='visibility-simple-select'
                                    name='visibility'
                                    label='Visibility'
                                    value={formik.values.visibility}
                                    onChange={formik.handleChange}
                                    error={Boolean(formik.errors.visibility)}
                                    helperText={formik.errors.visibility}
                                >
                                    <MenuItem value={'public'}>Public</MenuItem>
                                    <MenuItem value={'private'}>Private</MenuItem>
                                    <MenuItem value={'unlisted'}>Unlisted</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                id='thumbnailUrl'
                                name='thumbnailUrl'
                                label='Thumbnail URL'
                                value={formik.values.thumbnailUrl}
                                onChange={formik.handleChange}
                                error={
                                    formik.touched.thumbnailUrl &&
                                    Boolean(formik.errors.thumbnailUrl)
                                }
                                helperText={
                                    formik.touched.thumbnailUrl && formik.errors.thumbnailUrl
                                }
                            />
                            <FormControl fullWidth>
                                <InputLabel id='language-select-label'>Language</InputLabel>
                                <Select
                                    labelId='language-select-label'
                                    id='language-simple-select'
                                    label='Language'
                                    value={formik.values.language}
                                    onChange={formik.handleChange}
                                    error={Boolean(formik.errors.language)}
                                    helperText={formik.errors.language}
                                >
                                    <MenuItem value={'English'}>English</MenuItem>
                                    <MenuItem value={'Bangla'}>Bangla</MenuItem>
                                    <MenuItem value={'Spanish'}>Spanish</MenuItem>
                                    <MenuItem value={'Hindi'}>Hindi</MenuItem>
                                    <MenuItem value={'Urdu'}>Urdu</MenuItem>
                                </Select>
                            </FormControl>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label='Basic example'
                                    value={formik.values.recordingDate}
                                    inputFormat='DD/MM/YYYY'
                                    onChange={(newValue) => {
                                        formik.setFieldValue('recordingDate', newValue);
                                    }}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </LocalizationProvider>
                            <FormControl fullWidth>
                                <InputLabel id='category-select-label'>Category</InputLabel>
                                <Select
                                    labelId='category-select-label'
                                    id='category-simple-select'
                                    value={formik.values.category}
                                    label='Category'
                                    onChange={formik.handleChange}
                                    error={Boolean(formik.errors.category)}
                                    helperText={formik.errors.category}
                                >
                                    <MenuItem value={'Education'}>Education</MenuItem>
                                    <MenuItem value={'Technology'}>Technology</MenuItem>
                                    <MenuItem value={'Travel'}>Travel</MenuItem>
                                    <MenuItem value={'Others'}>Others</MenuItem>
                                </Select>
                            </FormControl>
                            <LoadingButton
                                //fullWidth
                                size='large'
                                type='submit'
                                variant='contained'
                                disabled={formik.isSubmitting || !formik.isValid}
                            >
                                Upload
                            </LoadingButton>
                        </Stack>
                    </form>
                </UploadModalContainer>
            </Modal>
        </>
    );
};

export default VideoForm;