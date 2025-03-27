import { useState } from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Input, addToast } from "@heroui/react";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AddIcon from "@mui/icons-material/Add";
import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";
// TODO: Toast einbauen für Fehlermeldungen und Erfolgsmeldungen
// TODO: Farbe ggf. anpassen weil der Theme Toggle heller ist

const AddUser = () => {
  const location = useLocation(); // Get the location object
  const listId = location.state.id; // Get the list ID from the location object
  const [userName, setUserName] = useState<string>("");

  const handleAddUser = () => {
    fetch("http://localhost:4000/api/lists/" + listId + "/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        userId: Cookies.get("userId") || "",
      },
      body: JSON.stringify({
        assignedUserName: userName,
      }),
    })
      .then((response) => {
        if (response.ok) {
          addToast({
            title: "User added",
            description: "User " + userName + " added to list",
            color: "success",
          });
        } else if (response.status == 404) {
          addToast({
            title: "User not found",
            description: "User " + userName + " not found",
            color: "danger",
          });
        } else if (response.status == 409) {
          addToast({
            title: "User already in list",
            description: "User " + userName + " is already in list",
            color: "danger",
          });
        }
      })
      .catch((error) => {
        addToast({
          title: "An error occured",
          description: "An error occured while adding user to list: " + error,
          color: "danger",
        });
      });
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <PersonAddIcon style={{ fontSize: "2rem" }} />
      </DropdownTrigger>
      <DropdownMenu aria-label="Static Actions" onClose={() => setUserName("")} closeOnSelect={false}>
        <DropdownItem
          key={"test"}
          startContent={
            <Button isIconOnly aria-label="Take a photo" color="primary" variant="faded" onPress={handleAddUser}>
              <AddIcon />
            </Button>
          }
        >
          <Input
            name="listName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Add user to list"
          />
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default AddUser;
