import { Helmet } from "react-helmet-async";
// @mui
import {
  Container,
  Stack, Typography
} from "@mui/material";
import { styled } from "@mui/material/styles";


import ReactPlayer from "react-player";

import React from "react";
import * as yup from "yup";


const StyledContent = styled("div")(({ theme }) => ({
  maxWidth: 600,
  margin: "auto",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignContent: "center",
  alignItems: "left",
  flexDirection: "column",
  padding: theme.spacing(12, 0),
}));

/**
 *  Create a MUI form to save below video properties: 
    title, description, visibility, 
    thumbnailUrl, language, recordingDate, 
    category,
 */

const validationSchema = yup.object({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  visibility: yup.string().required("Visibility is required"),
  thumbnailUrl: yup.string().required("Thumbnail URL is required"),
  language: yup.string().required("Language is required"),
  recordingDate: yup.date().required("Recording date is required"),
  category: yup.string().required("Category is required"),
});

export default function VideoUploadPage() {



  return (
    <>
      <Helmet>
        <title> Video upload</title>
      </Helmet>

      <>
        <Container>
          <StyledContent>
            <Typography variant="h4" sx={{ mb: 5 }}>
              Upload video
            </Typography>
            <Stack>
              <ReactPlayer
                url="http://127.0.0.1:4001/video-1692893985223-430808604.m3u8"
                controls
                playing
                width="100%"
                height="100%"
                config={{
                  file: { attributes: { controlsList: "nodownload" } },
                }}
              />
            </Stack>
          </StyledContent>
        </Container>
      </>
    </>
  );
}
