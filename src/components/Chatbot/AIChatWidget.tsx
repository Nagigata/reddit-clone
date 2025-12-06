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
  Badge,
  Divider,
  Stack,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";
import { BsChatDotsFill, BsX, BsSend, BsRobot, BsArrowsAngleContract, BsArrowsAngleExpand } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { factCheckService } from "../../services/factCheckService";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  factCheckResults?: Array<{
    claim: string;
    verdict: string;
    explanation: string;
  }>;
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
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.length > 0
      ? initialMessages
      : [
          {
            id: "1",
            role: "assistant",
            content: "Hello! I'm your AI fact-checking assistant. Send me a claim or statement, and I'll help verify it for you!",
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

    const claim = inputValue.trim();
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const results = await factCheckService.checkClaim(claim);
      
      if (results && results.length > 0) {
        // Format the response nicely
        let responseContent = "Fact-Check Results:\n\n";
        
        results.forEach((result, index) => {
          responseContent += `Claim: ${result.claim}\n`;
          responseContent += `Verdict: ${result.verdict}\n`;
          responseContent += `Explanation: ${result.explanation}\n`;
          if (index < results.length - 1) {
            responseContent += "\n---\n\n";
          }
        });

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: responseContent,
          timestamp: new Date(),
          factCheckResults: results,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I couldn't find any fact-check results for that claim. Please try rephrasing your question.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Error checking fact:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error while checking the fact. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              width: isMaximized ? "90vw" : "380px",
              height: isMaximized ? "90vh" : "600px",
              bottom: isMaximized ? "5vh" : "90px",
              right: isMaximized ? "5vw" : "20px",
            }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              zIndex: 999,
              maxWidth: isMaximized ? "90vw" : "380px",
              maxHeight: isMaximized ? "90vh" : "600px",
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
                <HStack spacing={2}>
                  <IconButton
                    aria-label={isMaximized ? "Minimize chat" : "Maximize chat"}
                    icon={<Icon as={isMaximized ? BsArrowsAngleContract : BsArrowsAngleExpand} />}
                    size="md"
                    variant="ghost"
                    color="white"
                    _hover={{ bg: "rgba(255,255,255,0.2)" }}
                    onClick={() => setIsMaximized(!isMaximized)}
                  />
                  <IconButton
                    aria-label="Close chat"
                    icon={<BsX />}
                    size="lg"
                    variant="ghost"
                    color="white"
                    _hover={{ bg: "rgba(255,255,255,0.2)" }}
                    onClick={() => setIsOpen(false)}
                  />
                </HStack>
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
                        {message.factCheckResults && message.factCheckResults.length > 0 ? (
                          <Stack spacing={3}>
                            <Text fontSize="sm" fontWeight="bold" mb={2}>
                              Fact-Check Results:
                            </Text>
                            {message.factCheckResults.map((result, index) => (
                              <Box key={index}>
                                <VStack align="stretch" spacing={2}>
                                  <Box>
                                    <Text fontSize="xs" fontWeight="semibold" mb={1} opacity={0.8}>
                                      Claim:
                                    </Text>
                                    <Text fontSize="sm">{result.claim}</Text>
                                  </Box>
                                  <Box>
                                    <Text fontSize="xs" fontWeight="semibold" mb={1} opacity={0.8}>
                                      Verdict:
                                    </Text>
                                    <Badge
                                      colorScheme={
                                        result.verdict === "TRUE" || result.verdict === "true"
                                          ? "green"
                                          : result.verdict === "FALSE" || result.verdict === "false"
                                          ? "red"
                                          : "yellow"
                                      }
                                      fontSize="xs"
                                    >
                                      {result.verdict}
                                    </Badge>
                                  </Box>
                                  <Box>
                                    <Text fontSize="xs" fontWeight="semibold" mb={1} opacity={0.8}>
                                      Explanation:
                                    </Text>
                                    <Text fontSize="sm">{result.explanation}</Text>
                                  </Box>
                                </VStack>
                                {index < message.factCheckResults!.length - 1 && (
                                  <Divider my={3} />
                                )}
                              </Box>
                            ))}
                          </Stack>
                        ) : (
                          <Text fontSize="sm" whiteSpace="pre-wrap">
                            {message.content}
                          </Text>
                        )}
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
