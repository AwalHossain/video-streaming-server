import { useEffect, useState } from "react";

import {
  Alert,
  Snackbar, Stack
} from "@mui/material";

// routes
import Router from "./routes";
// theme
import ThemeProvider from "./theme";
// components
import { StyledChart } from "./components/chart";
import ScrollToTop from "./components/scroll-to-top";

import { useSocket } from './contexts/SocketContext';


export default function App() {
  const socket = useSocket();
  const [wsResponse, setWsResponse] = useState(null); 

useEffect(() => {

    // socket.emit("mn", "hello")
    console.log("socket", socket);
    socket.on("hello", (msg) => {
      console.log("got data", msg);
      setWsResponse(
        `Video ${msg} HLS stream is ready to be played as ${msg.originalname}.m3u8`
      );
    }
    );
}, [socket])

  return (
    <ThemeProvider>
      <ScrollToTop />
      <StyledChart />
      <Router />
      <Stack>
        <Snackbar
          open={wsResponse}
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
