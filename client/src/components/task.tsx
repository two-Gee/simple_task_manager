import { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Checkbox } from "@heroui/checkbox";
import { Chip } from "@heroui/chip";

import { TaskData } from "@/pages/list";

interface TaskProps {
  title: string;
  dueDate?: string;
  completed?: boolean;
  assignedUsers?: string[];
  openEditor: (taskData: TaskData) => void;
}

export const Task = ({
  title,
  dueDate,
  completed = false,
  assignedUsers,
  openEditor,
}: TaskProps) => {
  const [isCompleted, setIsCompleted] = useState(completed);

  return (
    <div className="w-5/6">
      <Card className="h-20">
        <CardBody
          onClick={() => {
            openEditor({
              title,
              dueDate,
              completed: isCompleted,
              assignedUsers,
            });
          }}
        >
          <div className="flex flex-row justify-between items-center gap-4">
            {/* Left side: checkbox, title, and due date */}
            <div className="flex flex-col gap-2">
              <Checkbox
                lineThrough
                color="secondary"
                isSelected={isCompleted}
                onValueChange={setIsCompleted}
              >
                <span className="text-base">{title}</span>
              </Checkbox>
              <span className="text-xs text-default-500 ml-7">
                {dueDate ? <>Due: {dueDate}</> : <>No due date</>}
              </span>
            </div>

            {/* Right side: assigned user */}
            {assignedUsers && (
              <div className="flex flex-col gap-2 items-end">
                <span className="text-sm">Assigned users:</span>
                <div className="flex flex-row gap-1">
                  {assignedUsers.map((user, index) => {
                    const colors = [
                      "primary",
                      "secondary",
                      "success",
                      "warning",
                      "danger",
                    ];
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
    </div>
  );
};
