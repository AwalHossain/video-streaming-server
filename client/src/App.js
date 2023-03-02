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
import { io } from 'socket.io-client';
import { StyledChart } from "./components/chart";
import ScrollToTop from "./components/scroll-to-top";

const socket = io('http://127.0.0.1:4000');


export default function App() {
  // const socket = useSocket();
  const [wsResponse, setWsResponse] = useState(null);

useEffect(() => {
  socket.on('connect', () => {
    console.log('connected')
  })


  socket.on('disconnect', () => {
    console.log("disconnect",false);
  });

    socket.on('message', (data) => {
      console.log(data)
      // setWsResponse(data)
    })

    socket.emit("mn", "hello")

  return () => {
    socket.off('connect');
    socket.off('disconnect');
    socket.off('pong');
  };
}, [])

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
