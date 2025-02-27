import { Box, Flex, Text, Button, Stack, IconButton } from "@chakra-ui/react";
import { FiLogIn, FiUserPlus, FiMessageSquare, FiLogOut } from "react-icons/fi";
import { useAuth } from "./AuthContext";
import { Outlet, useNavigate } from "react-router-dom";

export default function NavBar() {
  const { token, logout, username } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <Box
        position="fixed"
        top="0"
        width="100%"
        zIndex="1000"
        bgGradient="linear(to-r, blue.600, purple.500)"
        boxShadow="lg"
        backdropFilter="blur(10px)"
      >
        <Flex
          minH={"70px"}
          px={6}
          align={"center"}
          justify={"space-between"}
          color={"white"}
        >
          <Flex align="center" gap={4}>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              cursor="pointer"
              transition="all 0.3s"
              _hover={{ transform: "scale(1.05)", textDecoration: "underline" }}
              onClick={() => navigate("/")}
            >
              ChatSphere
            </Text>

            {token && (
              <Button
                leftIcon={<FiMessageSquare />}
                fontSize={"sm"}
                fontWeight={600}
                color={"white"}
                bg={"blue.400"}
                _hover={{ bg: "blue.300", transform: "scale(1.05)" }}
                transition="all 0.3s"
                onClick={() => navigate(`/conversation`)}
              >
                Chats
              </Button>
            )}
          </Flex>

          <Stack direction={"row"} spacing={4} align="center">
            {token ? (
              <Text fontSize={"md"} fontWeight={500}>
                Welcome, {username}!
              </Text>
            ) : (
              <IconButton
                aria-label="Login"
                icon={<FiLogIn />}
                fontSize={"lg"}
                variant="ghost"
                color="white"
                _hover={{ color: "gray.300" }}
                onClick={() => navigate("/login")}
              />
            )}
            {token ? (
              <Button
                leftIcon={<FiLogOut />}
                fontSize={"sm"}
                fontWeight={600}
                color={"white"}
                bg={"red.400"}
                _hover={{ bg: "red.300", transform: "scale(1.05)" }}
                transition="all 0.3s"
                onClick={logout}
              >
                Log out
              </Button>
            ) : (
              <Button
                leftIcon={<FiUserPlus />}
                fontSize={"sm"}
                fontWeight={600}
                color={"white"}
                bg={"green.400"}
                _hover={{ bg: "green.300", transform: "scale(1.05)" }}
                transition="all 0.3s"
                onClick={() => navigate("/signup")}
              >
                Sign up
              </Button>
            )}
          </Stack>
        </Flex>
      </Box>

      <Box pt="70px">
        <Outlet />
      </Box>
    </>
  );
}
