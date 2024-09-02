"use client";

import {
  Box,
  Button,
  Stack,
  TextField,
  Switch,
} from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm the Headstarter support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const hardCodedResponses = {
    "Help with pricing": "Our pricing plans are flexible and depend on your specific needs. For detailed information, please visit our pricing page or contact support.",
    "Technical support": "For technical support, please provide details about the issue you are facing, and our team will assist you shortly.",
    "General inquiry": "For any general inquiries, feel free to ask here or check our FAQ section on our website.",
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    // Add the user message to the messages array
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    // Check for hard-coded responses first
    if (hardCodedResponses[message]) {
      setMessages((messages) => [
        ...messages,
        {
          role: "assistant",
          content: hardCodedResponses[message],
        },
      ]);
      setMessage(""); // Clear the input field
      return; // Exit the function if a hard-coded response was found
    }

    // If no hard-coded response, proceed to call the API
    setMessage(""); // Clear the input field
    setIsLoading(true); // Set loading state

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, { role: "user", content: message }]),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((messages) => [
        ...messages,
        {
          role: "assistant",
          content:
            "I'm sorry, but I encountered an error. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const endConversation = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Conversation ended. Let me know if you need any help in the future",
      },
    ]);
    setMessage("");
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  const suggestedReplies = [
    "Help with pricing",
    "Technical support",
    "General inquiry",
  ];

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: "#1976d2",
      },
      secondary: {
        main: "#9c27b0",
      },
    },
  });

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh", // Full height of the viewport
        backgroundColor: darkMode ? "#121212" : "#f0f0f0", // Optional background color
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Box
          width="60vw" // Reduced width for smaller box
          height="70vh" // Reduced height for smaller box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          bgcolor={darkMode ? "background.default" : "background.paper"}
          border={darkMode ? "1px solid #444" : "1px solid black"}
          borderRadius="16px"
          boxShadow={
            darkMode
              ? "0px 0px 20px rgba(255,255,255,0.1)"
              : "0px 0px 20px rgba(0,0,0,0.1)"
          }
          p={4}
        >
          <Box
            position="absolute"
            top={20}
            fontWeight="bold"
            fontSize="1.5rem"
            textAlign="center"
            color={darkMode ? "#fff" : "#000"}
          >
            Your next AI assistant
          </Box>
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 20,
            }}
          >
            <Switch
              value="check"
              selected={darkMode}
              onChange={toggleTheme}
              style={{
                transition: "transform 0.3s ease-in-out", // Adds a smooth transition
              }}
            />
          </div>

          <Stack
            direction={"column"}
            width="100%"
            height="100%"
            spacing={3}
            bgcolor={darkMode ? "background.default" : "background.paper"}
            p={2}
            borderRadius="12px"
          >
            <Stack
              direction={"column"}
              spacing={2}
              flexGrow={1}
              overflow="auto"
              maxHeight="100%"
            >
              {messages.map((message, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent={
                    message.role === "assistant" ? "flex-start" : "flex-end"
                  }
                >
                  <Box
                    bgcolor={
                      message.role === "assistant"
                        ? "primary.main"
                        : "secondary.main"
                    }
                    color="white"
                    borderRadius={16}
                    p={3}
                    maxWidth="80%"
                  >
                    {message.content}
                  </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Stack>

            <Stack direction={"row"} spacing={1}>
              {suggestedReplies.map((reply, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  onClick={() => setMessage(reply)}
                  style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                >
                  {reply}
                </Button>
              ))}
            </Stack>

            <Stack direction={"row"} spacing={2} alignItems="center">
              <TextField
                label="Type a message"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                variant="outlined"
                style={{ borderRadius: "50px" }}
              />
              <Button
                variant="contained"
                onClick={sendMessage}
                disabled={isLoading}
                style={{ borderRadius: "50px", padding: "10px 20px" }}
              >
                {isLoading ? "Sending..." : "Send"}
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={endConversation}
                style={{ borderRadius: "50px", padding: "10px 20px" }}
              >
                End Conversation
              </Button>
            </Stack>
          </Stack>
        </Box>
      </ThemeProvider>
    </main>
  );
}
