import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  addToast,
} from "@heroui/react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom"; // Import useNavigate


export function LoginModal() {
  const { isLoggedIn, login } = useUser();
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isInvalid, setIsInvalid] = React.useState(false);
  const [userName, setUserName] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await loginUser(userName);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginUser = async (userName: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    fetch("http://localhost:4000/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: userName }),
    })
      .then((response) => 
      { 
        if (response.ok) {
          return response.json()
        }else{
          addToast({
            title: "Invalid Username",
            description: "Please enter a valid username.",
            color: 'danger',
          })
          setIsInvalid(true);
          setErrorMessage("Invalid username");
        }
      })
      .then((data) => {
        login(data.id);
        addToast({
          title: "Login successful",
          description: "Welcome back, "+userName,
          color: 'success',
        })
        navigate("/")

      })
  };

  return (
    <Modal
      isOpen={!isLoggedIn}
      isDismissable={false}
      hideCloseButton
      backdrop="blur"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Welcome Back</ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <Input
              label="Username"
              placeholder="Enter your username"
              type="text"
              value={userName}
              onValueChange={setUserName}
              isInvalid={isInvalid}
              errorMessage={errorMessage}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onPress={handleLogin}
            isLoading={isLoading}
            fullWidth
          >
            Log In
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
