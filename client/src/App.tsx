import React, { useState } from "react";

import {
  Alert,
  Snackbar,
  Stack
} from "@mui/material";

// routes
import Router from "./routes";
// theme
import ThemeProvider from "./theme";

// components
import { StyledChart } from "./components/chart";
import ScrollToTop from "./components/scroll-to-top";


export default function App(): JSX.Element {
  // const { socket } = useSocket();
  const [wsResponse, setWsResponse] = useState<string | null>(null);

  // useEffect(() => {
  //   if (socket) {
  //     socket.on("hello", (msg: { title: string; originalname: string }) => {
  //       console.log("hello", msg);
  //       setWsResponse(
  //         `Video ${msg.title} HLS conversion completed as ${msg.originalname}`
  //       );
  //     });
  //   }
  // }, [socket]);

  return (
    <ThemeProvider>
      <ScrollToTop />
      <StyledChart />
      <Router />
      <Stack>
        <Snackbar
          open={!!wsResponse}
          autoHideDuration={5000}
          onClose={() => {
            setWsResponse(null);
          }}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => {
              setWsResponse(null);
            }}
            severity={"success"}
          >
            {wsResponse}
          </Alert>
        </Snackbar>
      </Stack>
    </ThemeProvider>
  );
}