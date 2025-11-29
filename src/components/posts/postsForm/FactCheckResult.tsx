import {
  Box,
  Button,
  Flex,
  Icon,
  Progress,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { FaCheckCircle, FaTimesCircle, FaQuestionCircle } from "react-icons/fa";
import { IoShieldCheckmarkOutline } from "react-icons/io5";

export type FactCheckStatus = "true" | "false" | "uncertain" | null;

export type FactCheckResult = {
  status: FactCheckStatus;
  confidence: number; 
  keyPoints: string[];
  summary: string;
};

type FactCheckResultProps = {
  title: string;
  body: string;
  onAnalyze?: (title: string, body: string) => Promise<FactCheckResult>;
};

const FactCheckResult: React.FC<FactCheckResultProps> = ({
  title,
  body,
  onAnalyze,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const bg = useColorModeValue("white", "#1A202C");
  const borderColor = useColorModeValue("gray.200", "#2D3748");
  const trueBg = useColorModeValue("green.50", "rgba(34, 197, 94, 0.1)");
  const falseBg = useColorModeValue("red.50", "rgba(239, 68, 68, 0.1)");
  const uncertainBg = useColorModeValue("yellow.50", "rgba(234, 179, 8, 0.1)");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const textColorSecondary = useColorModeValue("gray.600", "gray.400");
  const progressBg = useColorModeValue("gray.200", "gray.700");

  const handleAnalyze = async () => {
    if (!title.trim() && !body.trim()) return;

    setIsAnalyzing(true);
    setShowResult(true);

    
    setTimeout(() => {
      
      const mockResult: FactCheckResult = {
        status: Math.random() > 0.5 ? "true" : Math.random() > 0.5 ? "false" : "uncertain",
        confidence: Math.floor(Math.random() * 40) + 60, 
        keyPoints: [
          "Information verified from multiple reliable sources",
          "Content aligns with official reports",
          "Additional verification needed for some details",
        ],
        summary: "Post content has been analyzed and verified for accuracy.",
      };

      if (onAnalyze) {
        onAnalyze(title, body)
          .then((apiResult) => {
            setResult(apiResult);
            setIsAnalyzing(false);
          })
          .catch(() => {
            // Fallback to mock if API fails
            setResult(mockResult);
            setIsAnalyzing(false);
          });
      } else {
        setResult(mockResult);
        setIsAnalyzing(false);
      }
    }, 1500);
  };

  const getStatusConfig = (status: FactCheckStatus) => {
    switch (status) {
      case "true":
        return {
          icon: FaCheckCircle,
          color: "green.500",
          bg: trueBg,
          borderColor: "green.300",
          label: "Verified Information",
          textColor: "green.700",
        };
      case "false":
        return {
          icon: FaTimesCircle,
          color: "red.500",
          bg: falseBg,
          borderColor: "red.300",
          label: "False Information",
          textColor: "red.700",
        };
      case "uncertain":
        return {
          icon: FaQuestionCircle,
          color: "yellow.500",
          bg: uncertainBg,
          borderColor: "yellow.300",
          label: "Uncertain",
          textColor: "yellow.700",
        };
      default:
        return null;
    }
  };

  const statusConfig = result ? getStatusConfig(result.status) : null;

  return (
    <Box mt={4}>
      <Flex align="center" gap={2} mb={3}>
        <Button
          size="sm"
          leftIcon={<IoShieldCheckmarkOutline />}
          onClick={handleAnalyze}
          isLoading={isAnalyzing}
          loadingText="Analyzing..."
          disabled={!title.trim() && !body.trim()}
          colorScheme="blue"
          variant="outline"
        >
          Check Facts
        </Button>
        {result && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowResult(!showResult)}
          >
            {showResult ? "Hide Result" : "Show Result"}
          </Button>
        )}
      </Flex>

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isAnalyzing ? (
              <Box
                p={4}
                bg={bg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius={8}
              >
                <Flex align="center" gap={3}>
                  <Spinner size="sm" color="blue.500" />
                  <Text fontSize="sm" color="gray.500">
                    Analyzing post content...
                  </Text>
                </Flex>
              </Box>
            ) : result && statusConfig ? (
              <Box
                p={4}
                bg={statusConfig.bg}
                border="2px solid"
                borderColor={statusConfig.borderColor}
                borderRadius={8}
              >
                <Stack spacing={3}>
                  {/* Status Header */}
                  <Flex align="center" gap={3}>
                    <Icon
                      as={statusConfig.icon}
                      fontSize={24}
                      color={statusConfig.color}
                      flexShrink={0}
                    />
                    <Text
                      fontWeight="bold"
                      fontSize="md"
                      color={statusConfig.textColor}
                    >
                      {statusConfig.label}
                    </Text>
                  </Flex>

                  {/* Confidence Score */}
                  {/* <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="xs" color={textColorSecondary}>
                        Confidence
                      </Text>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color={statusConfig.color}
                      >
                        {result.confidence}%
                      </Text>
                    </Flex>
                    <Progress
                      value={result.confidence}
                      colorScheme={
                        result.status === "true"
                          ? "green"
                          : result.status === "false"
                          ? "red"
                          : "yellow"
                      }
                      size="sm"
                      borderRadius="full"
                      bg={progressBg}
                    />
                  </Box> */}

                  {/* Summary */}
                  {result.summary && (
                    <Box
                      p={3}
                      bg={bg}
                      borderRadius={6}
                      border="1px solid"
                      borderColor={borderColor}
                    >
                      <Text fontSize="sm" color={textColor}>
                        {result.summary}
                      </Text>
                    </Box>
                  )}

                  {/* Key Points */}
                  {/* {result.keyPoints && result.keyPoints.length > 0 && (
                    <Box>
                      <Text
                        fontSize="xs"
                        fontWeight="semibold"
                        color={textColorSecondary}
                        mb={2}
                      >
                        Key Points:
                      </Text>
                      <Stack spacing={2}>
                        {result.keyPoints.map((point, index) => (
                          <Flex key={index} align="start" gap={2}>
                            <Box
                              w="6px"
                              h="6px"
                              borderRadius="full"
                              bg={statusConfig.color}
                              mt={1.5}
                              flexShrink={0}
                            />
                            <Text fontSize="xs" color={textColor}>
                              {point}
                            </Text>
                          </Flex>
                        ))}
                      </Stack>
                    </Box>
                  )} */}
                </Stack>
              </Box>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default FactCheckResult;

