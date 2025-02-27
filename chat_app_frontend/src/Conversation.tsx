import { useState } from "react";
import { useAuth } from "./AuthContext";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Card,
  CloseButton,
  Container,
  Flex,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Text,
  Textarea,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { formatDistance } from "date-fns";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteMessage,
  getConversation,
  editMessage,
  sendMessage,
} from "./api";

export default function Conversation() {
  const [newMessage, setNewMessage] = useState("");
  const [editedMessageId, setEditedMessageId] = useState("");
  const [editedMessageText, setEditedMessageText] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { token, userId } = useAuth();
  const { conversationId } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const queryClient = useQueryClient();

  const {
    data: chat,
    error: errorFetch,
    isLoading,
  } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      if (!conversationId || !token)
        throw new Error("Missing parameters for fetching conversation.");
      return await getConversation(conversationId, token);
    },
    enabled: !!conversationId && !!token,
  });

  const { mutate: sendingMessage } = useMutation({
    mutationFn: async () => {
      if (!conversationId || !token || !userId)
        throw new Error("Missing required parameters for sending message");
      return await sendMessage(newMessage, conversationId, token);
    },
    onSuccess: async () => {
      setNewMessage("");
      await queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });
    },
    onError: (error) => setErrorMsg(error.message || "Failed to send message."),
  });

  const { mutate: deletingMessage } = useMutation({
    mutationFn: async (messageId: string) => {
      console.log("deleteMutation");
      if (!conversationId || !messageId || !token)
        throw new Error("Missing parameters.");
      return await deleteMessage(conversationId, messageId, token);
    },
    onSuccess: async () => {
      onClose();
      await queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });
    },
    onError: (error) =>
      setErrorMsg(error.message || "Failed to delete message."),
  });

  const { mutate: editingMessage } = useMutation({
    mutationFn: async () => {
      if (!conversationId || !editedMessageId || !token)
        throw new Error("Missing parameters.");
      return await editMessage(
        conversationId,
        editedMessageId,
        editedMessageText,
        token
      );
    },
    onSuccess: async () => {
      setEditedMessageId("");
      setEditedMessageText("");
      await queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });
    },
    onError: (error: any) =>
      setErrorMsg(error.message || "Failed to edit message."),
  });

  const handleEditSave = () => {
    editingMessage();
    setEditMode(false);
    onClose();
  };

  return (
    <Box
      bgGradient="linear(to-b, blue.300, purple.500)"
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      {isLoading ? (
        <Flex justify="center" align="center" height="100vh">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <Container
          maxWidth="100%"
          p={4}
          flex="1"
          display="flex"
          flexDirection="column"
        >
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
              <AlertDescription>
                {errorMsg || errorFetch?.message}
              </AlertDescription>
              <CloseButton
                position="absolute"
                right="8px"
                top="8px"
                onClick={() => setErrorMsg("")}
              />
            </Alert>
          )}
          <Box flex="1" overflowY="auto" maxH="75vh" p={4}>
            <VStack spacing={4} mt={4} align="stretch">
              {chat?.map((message: any) => (
                <Flex
                  key={message._id}
                  justifyContent={
                    message.user !== userId ? "flex-start" : "flex-end"
                  }
                >
                  <Card
                    bg="rgba(255, 255, 255, 0.2)"
                    backdropFilter="blur(10px)"
                    color="white"
                    p={3}
                    borderRadius="lg"
                    boxShadow="lg"
                    _hover={{ bg: "rgba(255, 255, 255, 0.3)" }}
                    onClick={() => {
                      setEditedMessageId(message._id);
                      setEditedMessageText(message.message);
                      onOpen();
                    }}
                  >
                    <Text fontWeight="bold">{message.message}</Text>
                    <Text fontSize="sm" align="right">
                      {formatDistance(new Date(message.time), new Date(), {
                        addSuffix: true,
                      })}
                    </Text>
                  </Card>
                </Flex>
              ))}
            </VStack>
          </Box>

          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
              <ModalHeader>Select Action</ModalHeader>
              <ModalCloseButton />

              {editMode ? (
                <>
                  <Textarea
                    value={editedMessageText}
                    onChange={(e) => setEditedMessageText(e.target.value)}
                    placeholder="Edit your message..."
                  />
                  <ModalFooter>
                    <Button
                      colorScheme="green"
                      mr={3}
                      onClick={() => {
                        setEditedMessageId("");
                        setEditMode(false);
                        onClose();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button colorScheme="blue" onClick={handleEditSave}>
                      Save
                    </Button>
                  </ModalFooter>
                </>
              ) : (
                <ModalFooter>
                  <Button colorScheme="green" mr={3} onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    colorScheme="blue"
                    mr={3}
                    onClick={() => setEditMode(true)}
                  >
                    Edit
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={() => deletingMessage(editedMessageId)}
                  >
                    Delete
                  </Button>
                </ModalFooter>
              )}
            </ModalContent>
          </Modal>

          <VStack
            position="sticky"
            bottom="0"
            width="100%"
            p={4}
            bg="rgba(255, 255, 255, 0.3)"
            backdropFilter="blur(8px)"
            borderRadius="lg"
            boxShadow="md"
          >
            <Textarea
              className="w-full p-2 border rounded-lg"
              maxWidth="60%"
              placeholder="Type your message here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={2}
            />
            <Button
              className="mt-2 w-full"
              maxWidth="40%"
              marginLeft={3}
              bgColor="blue.300"
              color="white"
              _hover={{ bg: "blue.200" }}
              onClick={() => newMessage.length > 0 && sendingMessage()}
            >
              Send
            </Button>
          </VStack>
        </Container>
      )}
    </Box>
  );
}
