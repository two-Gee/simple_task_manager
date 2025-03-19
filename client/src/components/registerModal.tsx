// RegisterModal.tsx
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
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";


export function RegisterModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [username, setUsername] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const navigate = useNavigate();
  const { isLoggedIn, login } = useUser();

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      if (!response.ok) {
        addToast({
          title: "Registration Failed",
          description: "That username might already exist or is invalid.",
          color: "danger",
        });
        setErrorMessage("Registration failed");
      } else {
        const data = await response.json();
        login(data.id, username);
        addToast({
          title: "User Created",
          description: "Welcome, " + username,
          color: "success",
        });
        setUsername("");
        onClose();
        navigate("/");
      }
    } catch (err) {
      console.error("Error registering user:", err);
      setErrorMessage("Error registering user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} hideCloseButton backdrop="blur">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Create Account</ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <Input
              label="Username"
              placeholder="Enter desired username"
              type="text"
              value={username}
              onValueChange={setUsername}
              errorMessage={errorMessage}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onPress={handleRegister}
            isLoading={isLoading}
            fullWidth
          >
            Sign Up
          </Button>
          <Button variant="light" onPress={() => onClose()}>
            Back to Login
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}