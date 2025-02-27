import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Card,
  Text,
  Alert,
  VStack,
  Box,
  Heading,
} from "@chakra-ui/react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { createDemoConversation } from "./api";

interface IFormInput {
  email: string;
  password: string;
}

export default function Login() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IFormInput>();

  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    reset();
    await login(data);
    navigate("/");
  };

  const handleDemoLogin = async () => {
    try {
      const data = await createDemoConversation();
      await login(data);

      navigate("/conversation");
    } catch (error) {
      console.error("Failed to start demo conversation:", error);
    }
  };

  return (
    <Box
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-b, blue.300, purple.500)"
    >
      <Card
        width="100%"
        maxW="400px"
        p={6}
        boxShadow="xl"
        borderRadius="lg"
        bg="white"
      >
        <Heading size="lg" textAlign="center" mb={4} color="gray.700">
          Welcome Back 👋
        </Heading>

        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/,
                    message: "Invalid email format",
                  },
                })}
                placeholder="Enter your email"
                size="lg"
              />
              {errors.email?.message && (
                <Alert status="error" fontSize="sm" mt={2} p={2}>
                  {errors.email.message}
                </Alert>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                {...register("password", {
                  required: "Password is required",
                  pattern: {
                    value:
                      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{6,16}$/,
                    message:
                      "Password must be 6-16 characters, include a number, an uppercase letter, and a special character",
                  },
                })}
                placeholder="Enter your password"
                size="lg"
              />
              {errors.password?.message && (
                <Alert status="error" fontSize="sm" mt={2} p={2}>
                  {errors.password.message}
                </Alert>
              )}
            </FormControl>

            <Button
              width="full"
              mt={4}
              size="lg"
              colorScheme="blue"
              isLoading={isSubmitting}
              type="submit"
            >
              Log In
            </Button>

            <Text fontSize="sm" mt={2} color="gray.600">
              Don't have an account?{" "}
              <Button
                variant="link"
                colorScheme="pink"
                onClick={() => navigate("/signup")}
              >
                Sign up
              </Button>
            </Text>
          </VStack>
        </form>

        <Button
          width="full"
          mt={4}
          size="lg"
          colorScheme="purple"
          onClick={handleDemoLogin}
        >
          Demo Account
        </Button>
      </Card>
    </Box>
  );
}
