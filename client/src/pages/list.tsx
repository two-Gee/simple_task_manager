import { useState, useEffect, useRef } from "react";
import { useDisclosure } from "@heroui/react";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import Cookies from "js-cookie";
import { useParams, useLocation } from "react-router-dom";
import { title } from "@/components/primitives";
import { Task } from "@/components/task";
import DefaultLayout from "@/layouts/default";
import { TaskEditor } from "@/components/taskEditor";
import { InputTask } from "@/components/inputTask";
import { PlusIcon } from "@/components/icons";
import { useClickOutside } from "@/hooks/useClickOutside";
import { socket } from "@/socket";

export type TaskData = {
  id: number;
  title: string;
  dueDate?: string;
  completed?: boolean;
  assignedUsers?: string[];
};

export default function ListPage() {
  const location = useLocation(); // Get the location object
  const listId = location.state.id; // Get the list ID from the location object
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const inputRef = useRef<HTMLDivElement>(null);

  // Use custom hook to close the task input when clicking outside
  useClickOutside(inputRef, () => {
    setIsInputOpen(false);
  });

  useEffect(() => {
    // Join the room with the listId
    socket.emit("joinList", listId.toString());

    fetchData();

    // Listen for taskAdded event
    socket.on("taskAdded", (newTask) => {
      setTasks((prevTasks) => [...prevTasks, newTask]);
    });

    socket.on("taskCompleted", ({ taskId }) => {
      setTasks((prevTasks) => setTaskCompleted(prevTasks, taskId));
    });

    // Cleanup on component unmount
    return () => {
      socket.emit("leaveList", listId);
      socket.off("taskAdded");
      socket.off("taskCompleted");
    };
  }, [listId]);

  const handleOpenEditor = (task: TaskData) => {
    setSelectedTask(task);
    onOpen();
  };

  const fetchData = () => {
    setLoading(true);
    // Fetch all tasks for the list
    fetch(`http://localhost:4000/api/lists/${listId}/tasks`, {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json",
        userId: Cookies.get("userId") || "",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setTasks(data);
        setLoading(false);
      })
      .catch((error) => console.error("Error fetching tasks:", error));
  };

  function setTaskCompleted(tasks: TaskData[], taskId: string) {
    var tasksNew = tasks.map((task) =>
      task.id.toString() === taskId
        ? { ...task, completed: !task.completed }
        : task
    );

    return tasksNew;
  }

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>List {listId}</h1>
        </div>
        {loading && (
          <Spinner
            className="mt-12"
            color="secondary"
            label="Loading tasks..."
            size="lg"
            variant="gradient"
          />
        )}
        {tasks &&
          tasks.map((task) => (
            <Task
              key={task.id}
              assignedUsers={task.assignedUsers}
              completed={task.completed}
              dueDate={task.dueDate}
              id={task.id}
              listId={listId}
              openEditor={() => handleOpenEditor(task)}
              title={task.title}
            />
          ))}
      </section>
      <section className="flex flex-col items-center py-8 md:py-10">
        {isInputOpen ? (
          <div ref={inputRef} className="w-5/6">
            <InputTask listId={listId} setTasks={setTasks} tasks={tasks} />
          </div>
        ) : (
          <Card className="w-5/6">
            <CardBody
              className="flex flex-col gap-6"
              onClick={() => setIsInputOpen(true)}
            >
              <Input
                isReadOnly
                placeholder="Add a new Task"
                startContent={
                  <PlusIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                }
                type="text"
                variant="faded"
              />
            </CardBody>
          </Card>
        )}
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
