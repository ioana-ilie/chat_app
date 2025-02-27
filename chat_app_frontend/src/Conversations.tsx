import {
  Card,
  CardBody,
  Image,
  Stack,
  Heading,
  Text,
  Button,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Grid,
  CloseButton,
  Container,
} from "@chakra-ui/react";
import { formatDistance } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getConversations } from "./api";
import { useState } from "react";

export default function Conversations() {
  const [errorMsg, setErrorMsg] = useState("");

  const { token, userId } = useAuth();
  const navigate = useNavigate();

  const {
    data: chats,
    error: errorFetch,
    isLoading,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!token) throw new Error("Missing authentication token.");
      return await getConversations(token);
    },
    enabled: !!token,
  });

  const handleConversationClick = (conversationId: any) => {
    navigate(`/conversation/${conversationId}`);
  };

  const handleNewConversationClick = () => {
    navigate("/newconversation");
  };

  return (
    <>
      <Box
        bgGradient="linear(to-b, blue.300, purple.500)"
        minH="100vh"
        p={6}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        {isLoading ? (
          <Center h="100vh">
            <Spinner size="xl" />
          </Center>
        ) : (
          <Container display="flex" flexDirection="column" alignItems="center">
            {(errorMsg || errorFetch) && (
              <Alert
                status="error"
                position="fixed"
                zIndex="1000"
                mt={4}
                borderRadius="md"
                boxShadow="md"
                alignSelf="center"
              >
                <AlertIcon />
                <AlertTitle>Error:</AlertTitle>
                <AlertDescription>{errorMsg}</AlertDescription>
                <CloseButton
                  position="absolute"
                  right="8px"
                  top="8px"
                  onClick={() => setErrorMsg("")}
                />
              </Alert>
            )}

            <Heading mb={8} mt={3} color="white">
              Your Conversations
            </Heading>

            <Grid gap={7} maxW="600px" width="100%">
              {chats?.map((chat: any) => {
                return (
                  <>
                    <Card
                      key={chat._id}
                      direction="row"
                      overflow="hidden"
                      variant="outline"
                      bg="white"
                      color="white"
                      transition="all 0.3s"
                      _hover={{ transform: "scale(1.02)", shadow: "lg" }}
                      cursor="pointer"
                      borderRadius="lg"
                      onClick={() => handleConversationClick(chat._id)}
                    >
                      <Image
                        objectFit="cover"
                        maxW="90px"
                        src="https://cdn-icons-png.flaticon.com/512/17/17004.png"
                        alt="User Image"
                        borderRadius="full"
                        m={3}
                      />
                      <Stack flex="1" p={4} spacing={1}>
                        <CardBody>
                          <Heading size="sm" color="blue.500">
                            {chat.users
                              .find((user: any) => userId !== user._id)
                              ?.username.charAt(0)
                              .toUpperCase() +
                              chat.users
                                .find((user: any) => userId !== user._id)
                                ?.username.slice(1)}
                          </Heading>

                          <Text fontSize="sm" color="gray.600">
                            {chat.messages.length > 0
                              ? chat.messages[0]?.message
                              : "No messages"}
                          </Text>
                        </CardBody>
                      </Stack>
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        align="right"
                        mt={20}
                        pr={4}
                        pb={2}
                      >
                        {chat.messages.length > 0 &&
                          formatDistance(chat.messages[0]?.time, new Date(), {
                            addSuffix: true,
                          })}
                      </Text>
                      {/* <Box>{onlineUsers.includes(chat.users[0] || chat.users[1]) ? "🟢 Online" : "⚫ Offline"}</Box> */}
                    </Card>
                  </>
                );
              })}
            </Grid>
            <Button
              mt={8}
              bgGradient="linear(to-r, blue.300, purple.400)"
              _hover={{ bgGradient: "linear(to-r, blue.500, purple.600)" }}
              color="white"
              borderRadius="full"
              px={6}
              py={3}
              fontSize="lg"
              fontWeight="bold"
              transition="all 0.3s"
              onClick={handleNewConversationClick}
            >
              Start a New Chat
            </Button>
          </Container>
        )}
      </Box>
    </>
  );
}
