import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from "@heroui/drawer";
import { Button } from "@heroui/button";
import { TaskData } from "@/pages/list";
import { DatePicker, DateValue, Input } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { useEffect, useState, Dispatch, SetStateAction, useRef } from "react";
import Cookies from "js-cookie";
import { Tooltip } from "@heroui/tooltip";
import { getLocalTimeZone, today } from "@internationalized/date";
import { useClickOutside } from "@/hooks/useClickOutside";

interface TaskEditorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTask: TaskData | null;
  setSelectedTask: Dispatch<SetStateAction<TaskData | null>>;
  listId: number;
}

export const unlockTask = (taskId: number, listId: number) => {
  console.log("Unlocking task", taskId);
  fetch(`http://localhost:4000/api/lists/${listId}/tasks/${taskId}/unlock`, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      userId: Cookies.get("userId") || "",
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => console.error("Error unlocking task:", error));
};

export const TaskEditor = ({ isOpen, onOpenChange, selectedTask, setSelectedTask, listId }: TaskEditorProps) => {
  const [dueDate, setDueDate] = useState<DateValue | null>(null);
  const [title, setTitle] = useState(selectedTask?.title);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  // Close input editing if clicking outside
  useClickOutside(inputRef, () => {
    setIsEditing(false);
    setTimeout(() => saveButtonRef.current?.focus(), 0);
  });

  const handleHeaderClick = () => {
    setIsEditing(true);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent default “submit” or focus shift
      setIsEditing(false);
      // Focus the "Save" button
      setTimeout(() => {
        saveButtonRef.current?.focus();
      }, 0);
    }
  };

  useEffect(() => {
    setTitle(selectedTask?.title || "");

    if (selectedTask?.dueDate) {
      setDueDate(parseDate(selectedTask.dueDate));
    }
  }, [selectedTask]);

  const handleDelete = () => {
    fetch(`http://localhost:4000/api/lists/${listId}/tasks/${selectedTask?.id}`, {
      method: "DELETE",
      headers: new Headers({
        "Content-Type": "application/json",
        userId: Cookies.get("userId") || "",
      }),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Task deleted successfully");
          onOpenChange(false);
        } else {
          console.error("Error deleting task:", response);
        }
      })
      .catch((error) => console.error("Error deleting task:", error));
  };

  const handleSave = ({ onClose }: { onClose: () => void }) => {
    fetch(`http://localhost:4000/api/lists/${listId}/tasks/${selectedTask?.id}`, {
      method: "PUT",
      headers: new Headers({
        "Content-Type": "application/json",
        userId: Cookies.get("userId") || "",
      }),
      body: JSON.stringify({
        title,
        dueDate: dueDate?.toString(),
        lockedBy: Cookies.get("userId") || "",
        lockExpiration: null,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setTitle(data.title);
        setDueDate(data.dueDate);
      })
      .catch((error: Error) => console.error("Error posting task:", error));

    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && selectedTask != null) {
      unlockTask(selectedTask?.id, listId);
      setSelectedTask(null);
    }
    onOpenChange(open);
  };

  return (
    <Drawer isOpen={isOpen} onOpenChange={handleOpenChange}>
      <DrawerContent>
        {(onClose) => (
          <>
            <DrawerHeader
              className="cursor-pointer text-3xl"
              onClick={isEditing ? undefined : handleHeaderClick}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (!isEditing) handleHeaderClick();
                }
              }}
            >
              {isEditing ? (
                <div ref={inputRef} className="w-5/6">
                  <Input
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleInputBlur}
                    onKeyDown={handleInputKeyDown}
                    variant="faded"
                  />
                </div>
              ) : (
                <Tooltip content="Click to edit the title" showArrow={true} placement="right-end">
                  {title}
                </Tooltip>
              )}
            </DrawerHeader>
            <DrawerBody className="flex flex-col gap-6 items-start">
              <div className="flex flex-row gap-6 justify-center">
                <DatePicker
                  className="max-w-40"
                  name="dueDate"
                  label="Due:"
                  labelPlacement="outside-left"
                  minValue={today(getLocalTimeZone())}
                  selectorButtonPlacement="start"
                  showMonthAndYearPickers
                  value={dueDate}
                  variant="faded"
                  onChange={(value) => setDueDate(value)}
                />
              </div>
            </DrawerBody>
            <DrawerFooter>
              <Button ref={saveButtonRef} color="primary" onPress={() => handleSave({ onClose })}>
                Save
              </Button>
              <Button color="danger" variant="light" onPress={handleDelete}>
                Delete
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};
