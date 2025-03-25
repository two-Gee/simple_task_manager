import { Card, CardBody } from "@heroui/card";
import { Checkbox } from "@heroui/checkbox";
import { Chip } from "@heroui/chip";
import { addToast, Select, SelectItem } from "@heroui/react";
import Cookies from "js-cookie";
import type { SelectedItems, Selection } from "@heroui/react";

import { formatDate } from "@/utils/dateFormatter";
import { User } from "@/pages/list";
import { useEffect, useState } from "react";
import useSound from "use-sound";

interface TaskProps {
  id: number;
  title: string;
  dueDate?: string;
  completed?: boolean;
  prevAssignedUsers?: User[];
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
  prevAssignedUsers = [],
  openEditor,
  listId,
  isLocked,
  users,
}: TaskProps) => {
  const [assignedUsers, setAssignedUsers] = useState<Selection>(new Set([]));
  const [play] = useSound("/completed.mp3", { volume: 0.25 });

  useEffect(() => {
    if (prevAssignedUsers) {
      const userIdStrings = prevAssignedUsers.map((u) => String(u.id));
      setAssignedUsers(new Set(userIdStrings));
    }
  }, []);

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
    const unassignedUser = Array.from(assignedUsers).find((user) => value instanceof Set && !value.has(user)) || null;
    const newlyAssignedUser =
      value instanceof Set
        ? Array.from(value).find((user) => assignedUsers instanceof Set && !assignedUsers.has(user))
        : null;

    const unassignedUserId = unassignedUser !== null ? Number(unassignedUser) : null;
    const newlyAssignedUserId = newlyAssignedUser !== null ? Number(newlyAssignedUser) : null;

    if (unassignedUserId !== null) {
      updateAssignments({ user: unassignedUserId, action: "remove", assignedUsers: value });
    } else if (newlyAssignedUserId !== null) {
      updateAssignments({ user: newlyAssignedUserId, action: "add", assignedUsers: value });
    }
  };

  const updateAssignments = ({
    user,
    action,
    assignedUsers,
  }: {
    user: number | null;
    action: string;
    assignedUsers: Selection;
  }) => {
    fetch(`http://localhost:4000/api/lists/${listId}/tasks/${id}/assign`, {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
        userId: Cookies.get("userId") || "",
      }),
      body: JSON.stringify({
        userId: user,
        add: action === "add" ? 1 : 0,
        remove: action === "remove" ? 1 : 0,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setAssignedUsers(assignedUsers);
      })
      .catch((error: Error) => console.error("Error posting task:", error));
  };

  return (
    <Card className="h-25">
      <CardBody
        onClick={() => {
          if (isLocked) {
            addToast({
              title: "Task is locked",
              description: "You cannot edit this task",
              color: "danger",
            });
          } else {
            openEditor();
          }
        }}
      >
        <div className="flex flex-row justify-between items-center gap-4">
          {/* Left side: checkbox, title, and due date */}
          <div className="flex flex-col gap-2">
            <Checkbox lineThrough color="secondary" isSelected={completed} onChange={() => handleTaskCompletion()}>
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
            selectedKeys={assignedUsers}
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
