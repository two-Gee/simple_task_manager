import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from "@heroui/drawer";
import { Button } from "@heroui/button";

import { TaskData } from "@/pages/list";

interface TaskEditorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTask: TaskData | null;
}

export const TaskEditor = ({ isOpen, onOpenChange, selectedTask }: TaskEditorProps) => {
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
              <Button color="danger" variant="light" onPress={onClose}>
                Delete
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};
