import {
  Box,
  Button,
  Flex,
  Icon,
  Input,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  Avatar,
  Spinner,
  IconButton,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";
import { BsChatDotsFill, BsX, BsSend, BsRobot } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type AIChatWidgetProps = {
  apiEndpoint?: string;
  initialMessages?: Message[];
};

const AIChatWidget: React.FC<AIChatWidgetProps> = ({
  apiEndpoint = "",
  initialMessages = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.length > 0
      ? initialMessages
      : [
          {
            id: "1",
            role: "assistant",
            content: "Hello! I'm your AI assistant. How can I help you today?",
            timestamp: new Date(),
          },
        ]
  );
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const bg = useColorModeValue("white", "#1A202C");
  const borderColor = useColorModeValue("gray.200", "#2D3748");
  const userMessageBg = useColorModeValue("brand.100", "brand.100");
  const assistantMessageBg = useColorModeValue("gray.100", "#2D3748");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const inputBg = useColorModeValue("gray.50", "#2D3748");
  const headerBg = useColorModeValue("brand.100", "brand.100");
  const scrollbarThumb = useColorModeValue("gray.300", "gray.600");
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate API call - replace with actual API call when ready
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: apiEndpoint
          ? "API response will appear here"
          : "I understand your message. This is a demo response. Connect an API endpoint to get real AI responses!",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);

    // Uncomment and use this when you have an API endpoint:
    /*
    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || data.message || "I'm sorry, I couldn't process that.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
    */
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
        }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          bg={headerBg}
          color="white"
          borderRadius="full"
          w="60px"
          h="60px"
          boxShadow="lg"
          _hover={{ bg: "brand.100", transform: "scale(1.05)" }}
          _active={{ transform: "scale(0.95)" }}
        >
          <Icon
            as={isOpen ? BsX : BsChatDotsFill}
            fontSize="24px"
            color="white"
          />
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              bottom: "90px",
              right: "20px",
              width: "380px",
              height: "600px",
              zIndex: 999,
            }}
          >
            <Box
              bg={bg}
              borderRadius="16px"
              boxShadow="2xl"
              border="1px solid"
              borderColor={borderColor}
              display="flex"
              flexDirection="column"
              h="100%"
              overflow="hidden"
            >
              {/* Header */}
              <Flex
                bg={headerBg}
                color="white"
                p={4}
                align="center"
                justify="space-between"
                borderRadius="16px 16px 0 0"
              >
                <HStack spacing={3}>
                  <Icon as={IoSparkles} fontSize="20px" />
                  <Text fontWeight="bold" fontSize="md">
                    AI Assistant
                  </Text>
                </HStack>
                <IconButton
                  aria-label="Close chat"
                  icon={<BsX />}
                  size="lg"
                  variant="ghost"
                  color="white"
                  _hover={{ bg: "rgba(255,255,255,0.2)" }}
                  onClick={() => setIsOpen(false)}
                />
              </Flex>

              {/* Messages */}
              <VStack
                flex={1}
                overflowY="auto"
                p={4}
                spacing={4}
                align="stretch"
                css={{
                  "&::-webkit-scrollbar": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: scrollbarThumb,
                    borderRadius: "3px",
                  },
                }}
              >
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Flex
                      align="flex-start"
                      gap={3}
                      direction={message.role === "user" ? "row-reverse" : "row"}
                    >
                      <Avatar
                        size="sm"
                        bg={message.role === "user" ? "gray.500" : "brand.100"}
                        icon={
                          message.role === "assistant" ? (
                            <Icon as={BsRobot} color="white" />
                          ) : undefined
                        }
                      />
                      <Box
                        maxW="75%"
                        p={3}
                        borderRadius="12px"
                        bg={
                          message.role === "user"
                            ? userMessageBg
                            : assistantMessageBg
                        }
                        color={message.role === "user" ? "white" : textColor}
                      >
                        <Text fontSize="sm" whiteSpace="pre-wrap">
                          {message.content}
                        </Text>
                      </Box>
                    </Flex>
                  </motion.div>
                ))}

                {isLoading && (
                  <Flex align="center" gap={3}>
                    <Avatar
                      size="sm"
                      bg="brand.100"
                      icon={<Icon as={BsRobot} color="white" />}
                    />
                    <Box
                      p={3}
                      borderRadius="12px"
                      bg={assistantMessageBg}
                      color={textColor}
                    >
                      <Spinner size="sm" color="brand.100" />
                    </Box>
                  </Flex>
                )}

                <div ref={messagesEndRef} />
              </VStack>

              {/* Input */}
              <Flex
                p={4}
                borderTop="1px solid"
                borderColor={borderColor}
                gap={2}
              >
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  bg={inputBg}
                  border="none"
                  borderRadius="full"
                  _focus={{
                    border: "1px solid",
                    borderColor: "brand.100",
                    boxShadow: "none",
                  }}
                  disabled={isLoading}
                />
                <IconButton
                  aria-label="Send message"
                  icon={<BsSend />}
                  bg="brand.100"
                  color="white"
                  borderRadius="full"
                  _hover={{ bg: "brand.100", transform: "scale(1.05)" }}
                  _active={{ transform: "scale(0.95)" }}
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                />
              </Flex>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatWidget;
