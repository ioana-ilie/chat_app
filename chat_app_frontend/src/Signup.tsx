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
import { useNavigate } from "react-router-dom";
import { signUp } from "./api";

interface IFormInput {
  email: string;
  password: string;
  username: string;
}

export default function SignUp() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IFormInput>();

  const navigate = useNavigate();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    reset();
    await signUp(data);
    navigate("/login");
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
          Create an Account 🚀
        </Heading>

        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.username}>
              <FormLabel>Username</FormLabel>
              <Input
                type="text"
                {...register("username", {
                  required: "Username is required",
                  minLength: { value: 5, message: "At least 5 characters" },
                  maxLength: { value: 20, message: "Max 20 characters" },
                })}
                placeholder="Choose a username"
                size="lg"
              />
              {errors.username?.message && (
                <Alert status="error" fontSize="sm" mt={2} p={2}>
                  {errors.username.message}
                </Alert>
              )}
            </FormControl>

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
                      "6-16 characters, 1 uppercase, 1 number & 1 special character",
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
              Sign Up
            </Button>

            <Text fontSize="sm" mt={2} color="gray.600">
              Already have an account?{" "}
              <Button
                variant="link"
                colorScheme="pink"
                onClick={() => navigate("/login")}
              >
                Log In
              </Button>
            </Text>
          </VStack>
        </form>
      </Card>
    </Box>
  );
}
