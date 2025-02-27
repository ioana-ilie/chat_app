import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Card,
  CardBody,
  CloseButton,
  Container,
  Flex,
  Grid,
  Heading,
  Image,
  Spinner,
  Stack,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import {
  getConversation,
  getConversations,
  createNewConversation,
  getUsers,
} from "./api";
import { useState } from "react";

export default function NewConversationUsers() {
  const [errorMsg, setErrorMsg] = useState("");

  const { token } = useAuth();
  const navigate = useNavigate();

  const {
    data: users,
    error: errorFetch,
    isLoading,
  } = useQuery({
    queryKey: ["users"],
    queryFn: () => token && getUsers(token),
  });

  const handleNewConversationClick = async (userId2: string) => {
    if (token) {
      await createNewConversation(userId2, token);

      const conversations = await getConversations(token);

      const conversation = conversations.find((chat: any) =>
        chat.users.some((user: any) => user._id === userId2)
      );

      if (!conversation) {
        console.error("Conversation not found!");
        return;
      }

      const conversationId = conversation._id;
      await getConversation(conversationId, token);
      navigate(`/conversation/${conversationId}`);
    }
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
          <Flex justify="center" align="center" height="100vh">
            <Spinner size="xl" />
          </Flex>
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
              New Conversation
            </Heading>

            <Grid gap={7} maxW="600px" width="100%">
              {users?.map((user: any) => {
                return (
                  <Card
                    key={user._id}
                    direction="row"
                    overflow="hidden"
                    variant="outline"
                    bg="white"
                    color="white"
                    transition="all 0.3s"
                    _hover={{ transform: "scale(1.02)", shadow: "lg" }}
                    cursor="pointer"
                    borderRadius="lg"
                    onClick={() => handleNewConversationClick(user._id)}
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
                          {user.username.charAt(0).toUpperCase() +
                            user.username.slice(1)}
                        </Heading>
                      </CardBody>
                    </Stack>
                  </Card>
                );
              })}
            </Grid>
          </Container>
        )}
      </Box>
    </>
  );
}
