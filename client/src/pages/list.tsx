import { useState } from "react";
import { useDisclosure } from "@heroui/react";

import { title } from "@/components/primitives";
import { Task } from "@/components/task";
import DefaultLayout from "@/layouts/default";
import { TaskEditor } from "@/components/taskEditor";

export type TaskData = {
  title: string;
  dueDate?: string;
  completed?: boolean;
  assignedUsers?: string[];
};

// Simple date formatter (DD.MM.YYYY)
function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());

  return `${day}.${month}.${year}`;
}

export default function ListPage({ name = 1 }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);

  // Handler that stores the entire task object, then opens the drawer
  function handleOpenEditor(task: TaskData) {
    setSelectedTask(task);
    onOpen();
  }

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>List {name}</h1>
        </div>
        <Task
          assignedUsers={["Lara", "Gerrit"]}
          dueDate={formatDate(new Date())}
          openEditor={handleOpenEditor}
          title="Task Manager für Verteilte Systeme bauen"
        />
        <Task
          dueDate={formatDate(new Date())}
          openEditor={handleOpenEditor}
          title="Essen kochen"
        />
        <Task
          assignedUsers={["Lara"]}
          openEditor={handleOpenEditor}
          title="Todo für Task Manager bauen"
        />
      </section>

      {/* Pass the selected task and isOpen to TaskEditor */}
      <TaskEditor
        isOpen={isOpen}
        selectedTask={selectedTask}
        onOpenChange={onOpenChange}
      />
    </DefaultLayout>
  );
}
