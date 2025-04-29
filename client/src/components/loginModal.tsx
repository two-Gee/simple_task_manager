import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, addToast } from "@heroui/react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { RegisterModal } from "./registerModal";

export function LoginModal() {
  const { isLoggedIn, login } = useUser();
  const [errorMessage, setErrorMessage] = React.useState("");
  const [userName, setUserName] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = React.useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userName,
        }),
      });

      if (!response.ok) {
        addToast({
          title: "Invalid Username",
          description: "The username you entered is not recognized. Please try again or sign up for a new account.",
          color: "danger",
        });
        setErrorMessage("Please enter a valid username.");
      } else {
        const data = await response.json();
        login(data.id, userName);
        addToast({
          title: "Login successful",
          description: "Welcome back, " + userName,
          color: "success",
        });
        navigate("/");
        window.location.reload();
        setUserName("");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setErrorMessage("Unable to log in.");
      addToast({
        title: "Login Failed",
        description: "An error occured while trying to log in. Please try again or sign up for a new account.",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={!isLoggedIn} isDismissable={false} hideCloseButton backdrop="blur">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Welcome Back</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                autoFocus
                label="Username"
                placeholder="Enter your username"
                type="text"
                value={userName}
                onValueChange={setUserName}
                isInvalid={errorMessage !== ""}
                errorMessage={errorMessage}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleLogin();
                  }
                }}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex flex-col gap-2 w-full">
              <Button color="primary" onPress={handleLogin} isLoading={isLoading} fullWidth type="submit">
                Log In
              </Button>
              <div>
                <p className="pt-5 text-xs text-right flex items-center justify-end gap-2">
                  Don't have an account?
                  <Button className="text-xs" variant="light" color="primary" onPress={() => setIsRegisterOpen(true)}>
                    Sign Up
                  </Button>
                </p>
              </div>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
    </>
  );
}
