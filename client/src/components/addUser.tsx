import { useState } from "react";
import { Button, Input, addToast, Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";
import { PlusIcon } from "./icons";
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
    <Popover offset={10} placement="bottom" onClose={() => setUserName("")}>
      <PopoverTrigger>
        <Button isIconOnly style={{ padding: 0, minWidth: "auto", background: "none", boxShadow: "none" }}>
          <PersonAddIcon style={{ fontSize: "2rem" }} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-2">
        <div className="flex flex-row gap-2">
          <Input
            autoFocus
            name="listName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Add user to list"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddUser();
              }
            }}
          />
          <Button isIconOnly aria-label="Add user to list" color="secondary" variant="solid" onPress={handleAddUser}>
            <PlusIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" color={"white"} />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AddUser;
