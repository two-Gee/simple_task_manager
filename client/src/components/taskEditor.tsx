import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from "@heroui/drawer";
import { Button } from "@heroui/button";
import { TaskData } from "@/pages/list";
import Cookies from "js-cookie";

interface TaskEditorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTask: TaskData;
  listId: number;
}

export const TaskEditor = ({ isOpen, onOpenChange, selectedTask, listId }: TaskEditorProps) => {
  const handleDelete = () => {
    fetch(`http://localhost:4000/api/lists/${listId}/tasks/${selectedTask.id}`, {
      method: "DELETE",
      headers: new Headers({
        "Content-Type": "application/json",
        "userId": Cookies.get("userId") || "",
      }),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Task deleted successfully");
          onOpenChange(false);
        }else{
          console.error("Error deleting task:", response);
        }
      })
      .catch((error) => console.error("Error deleting task:", error));
  };
  return (
    <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        {(onClose) => (
          <>
            <DrawerHeader className="flex flex-col gap-1">{selectedTask?.title}</DrawerHeader>
            <DrawerBody>
              <span className="text-base">Due Date: {selectedTask?.dueDate || "—"}</span>
            </DrawerBody>
            <DrawerFooter>
              <Button color="primary" onPress={onClose}>
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
