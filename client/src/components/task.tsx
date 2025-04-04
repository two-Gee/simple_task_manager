import { Card, CardBody } from "@heroui/card";
import { Checkbox } from "@heroui/checkbox";
import { Chip } from "@heroui/chip";
import { addToast, Select, SelectItem } from "@heroui/react";
import Cookies from "js-cookie";
import type { SelectedItems, Selection } from "@heroui/react";
import { formatDate } from "@/utils/dateFormatter";
import { User } from "@/pages/list";
import useSound from "use-sound";

interface TaskProps {
  id: number;
  title: string;
  dueDate?: string;
  completed?: boolean;
  isTempCompleted?: boolean;
  assignedUser?: User[];
  users: User[];
  openEditor: () => void;
  listId: number;
  isLocked: boolean;
}

export const Task = ({
  id,
  title,
  dueDate,
  completed = false,
  isTempCompleted = false,
  assignedUser = [],
  openEditor,
  listId,
  isLocked,
  users,
}: TaskProps) => {
  const [play] = useSound("/completed.mp3", { volume: 0.25 });
  const handleTaskCompletion = () => {
    play();

    fetch(`http://localhost:4000/api/lists/${listId}/tasks/${id}/complete`, {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
        userId: Cookies.get("userId") || "",
      }),
    }).catch((error) => console.error("Error posting task:", error));
  };

  const handleSelect = (value: Selection) => {
    const unassignedUser = assignedUser.find((user) => value instanceof Set && !value.has(String(user.id))) || null;
    const newlyAssignedUser =
      value instanceof Set
        ? Array.from(value).find((key) => !assignedUser.some((user) => String(user.id) === key))
        : null;

    const unassignedUserId = unassignedUser !== null ? unassignedUser.id : null;
    const newlyAssignedUserId = newlyAssignedUser !== null ? Number(newlyAssignedUser) : null;

    if (unassignedUserId !== null) {
      removeAssignedUser(unassignedUserId, value);
    } else if (newlyAssignedUserId !== null) {
      addAssignedUser(newlyAssignedUserId, value);
    }
  };

  const addAssignedUser = (user: number, assignedUsers: Selection) => {
    fetch(`http://localhost:4000/api/lists/${listId}/tasks/${id}/assign`, {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
        userId: Cookies.get("userId") || "",
      }),
      body: JSON.stringify({
        userId: user,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error: Error) => console.error("Error posting task:", error));
  };

  const removeAssignedUser = (user: number, assignedUsers: Selection) => {
    fetch(`http://localhost:4000/api/lists/${listId}/tasks/${id}/unassign`, {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
        userId: Cookies.get("userId") || "",
      }),
      body: JSON.stringify({
        userId: user,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error: Error) => console.error("Error posting task:", error));
  };

  return (
    <Card
      className="h-25 w-full"
      isPressable
      onPress={() => {
        console.log("pressed");
        if (isLocked) {
          addToast({
            title: "Task is locked",
            description: "You cannot edit this task while another user is editing.",
            color: "danger",
          });
        } else {
          openEditor();
        }
      }}
    >
      <CardBody>
        <div className="flex flex-row justify-between items-center gap-4">
          {/* Left side: checkbox, title, and due date */}
          <div className="flex flex-col gap-2">
            <Checkbox
              lineThrough
              color="secondary"
              isSelected={completed || isTempCompleted}
              onChange={() => {
                console.log("onChange");
                handleTaskCompletion();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTaskCompletion();
                }
              }}
            >
              <span className="text-base">{title}</span>
            </Checkbox>
            <span className="text-xs text-default-500 ml-7">
              {dueDate ? <>Due: {formatDate(dueDate)}</> : <>No due date</>}
            </span>
          </div>

          {/* Right side: assigned user */}
          <Select
            className="max-w-xs py-1"
            isMultiline
            items={users}
            label="Assigned users:"
            labelPlacement="outside"
            placeholder="Select users to assign"
            selectedKeys={new Set(assignedUser.map((u) => String(u.id)))}
            onSelectionChange={handleSelect}
            renderValue={(items: SelectedItems<User>) => {
              return (
                <div className="flex flex-wrap gap-2">
                  {items.map((item, index) => {
                    const colors = ["secondary", "primary", "success", "warning", "danger"];
                    const color = colors[index % colors.length] as
                      | "primary"
                      | "secondary"
                      | "success"
                      | "warning"
                      | "danger";

                    return (
                      <Chip key={item.key} color={color} variant="flat">
                        {item.textValue}
                      </Chip>
                    );
                  })}
                </div>
              );
            }}
            selectionMode="multiple"
            variant="underlined"
          >
            {users.length > 0
              ? users.map((user) => (
                  <SelectItem key={user.id} textValue={user.username}>
                    {user.username}
                  </SelectItem>
                ))
              : null}
          </Select>
        </div>
      </CardBody>
    </Card>
  );
};
