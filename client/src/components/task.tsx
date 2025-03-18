import { Card, CardBody } from "@heroui/card";
import { Checkbox } from "@heroui/checkbox";
import { Chip } from "@heroui/chip";
import { addToast } from "@heroui/react";
import Cookies from "js-cookie";

import { formatDate } from "@/utils/dateFormatter";

interface TaskProps {
  id: number;
  title: string;
  dueDate?: string;
  completed?: boolean;
  assignedUsers?: string[];
  openEditor: () => void;
  listId: number;
  isLocked: boolean;
}

export const Task = ({ id, title, dueDate, completed = false, assignedUsers = [], openEditor, listId, isLocked }: TaskProps) => {
  const handleTaskCompletion = () => {
    fetch(`http://localhost:4000/api/lists/${listId}/tasks/${id}/complete`, {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
        userId: Cookies.get("userId") || "",
      }),
    }).catch((error) => console.error("Error posting task:", error));
  };

  return (
    <Card className="h-20">
      <CardBody
        onClick={() => {
          if(isLocked){
            addToast({
              title: "Task is locked",
              description: "You cannot edit this task",
              color: "danger",
            });
          }else{
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
          {assignedUsers && (
            <div className="flex flex-col gap-2 items-end">
              <span className="text-sm">Assigned users:</span>
              <div className="flex flex-row gap-1">
                {assignedUsers.map((user, index) => {
                  const colors = ["secondary", "primary", "success", "warning", "danger"];
                  const color = colors[index % colors.length] as
                    | "primary"
                    | "secondary"
                    | "success"
                    | "warning"
                    | "danger";

                  return (
                    <Chip key={user} color={color} variant="flat">
                      {user}
                    </Chip>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
