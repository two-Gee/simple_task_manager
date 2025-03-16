import { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Checkbox } from "@heroui/checkbox";
import { Chip } from "@heroui/chip";
import { formatDate } from "@/utils/dateFormatter";

interface TaskProps {
  id: number;
  title: string;
  dueDate?: string;
  completed?: boolean;
  assignedUsers?: string[];
  openEditor: () => void;
}

export const Task = ({
  id,
  title,
  dueDate,
  completed = false,
  assignedUsers = [],
  openEditor,
}: TaskProps) => {
  const [isCompleted, setIsCompleted] = useState(completed);

  return (
    <div className="w-5/6">
      <Card className="h-20">
        <CardBody
          onClick={() => {
            openEditor();
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
                {dueDate ? <>Due: {formatDate(dueDate)}</> : <>No due date</>}
              </span>
            </div>

            {/* Right side: assigned user */}
            {assignedUsers && (
              <div className="flex flex-col gap-2 items-end">
                <span className="text-sm">Assigned users:</span>
                <div className="flex flex-row gap-1">
                  {assignedUsers.map((user, index) => {
                    const colors = [
                      "secondary",
                      "primary",
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
