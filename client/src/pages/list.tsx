import { useState, useEffect, useRef } from "react";
import { useDisclosure } from "@heroui/react";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";
import { title } from "@/components/primitives";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Image } from "@heroui/image";
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
  assignedUsers?: User[];
  isLocked: boolean;
};

export type User = {
  id: number;
  username: string;
};

export default function ListPage() {
  const location = useLocation(); // Get the location object
  const listId = location.state.id; // Get the list ID from the location object
  const listName = location.state.name; // Get the list ID from the location object
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const inputRef = useRef<HTMLDivElement>(null);

  // Use custom hook to close the task input when clicking outside
  useClickOutside(inputRef, () => {
    setIsInputOpen(false);
  });

  useEffect(() => {
    // Join the room with the listId
    socket.emit("joinList", listId.toString());

    fetchData();
    fetchUsers();

    // Listen for taskAdded event
    socket.on("taskAdded", (newTask) => {
      setTasks((prevTasks) => [...prevTasks, newTask]);
    });

    socket.on("taskCompleted", ({ taskId }) => {
      setTasks((prevTasks) => setTaskCompleted(prevTasks, taskId));
    });

    socket.on("taskDeleted", (id) => {
      console.log("Task deleted:", id);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id.toString() !== id));
    });

    socket.on("taskAssigned", ({ taskId, user }) => {
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) => {
          if (task.id.toString() === taskId) {
            task.assignedUsers = task.assignedUsers || [];
            if (!task.assignedUsers.some((assignedUser) => assignedUser.id === user.id)) {
              task.assignedUsers = [...task.assignedUsers, user];
            }
          }
          return task;
        });
        return updatedTasks;
      });
    });

    socket.on("taskUnassigned", ({ taskId, userId }) => {
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) => {
          if (task.id.toString() === taskId) {
            task.assignedUsers = task.assignedUsers?.filter((assignedUser) => assignedUser.id !== userId) || [];
          }
          return task;
        });
        return updatedTasks;
      });
    });

    socket.on("newUserAssignedToList", ({ user }) => {
      setUsers((prevUsers) => {
      if (!prevUsers.some((existingUser) => existingUser.id === user.id)) {
        return [...prevUsers, user];
      }
      return prevUsers;
      });
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

  const fetchUsers = () => {
    fetch(`http://localhost:4000/api/lists/${listId}/users`, {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json",
        userId: Cookies.get("userId") || "",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => console.error("Error fetching users in list:", error));
  };

  function setTaskCompleted(tasks: TaskData[], taskId: string) {
    let tasksNew = tasks.map((task) =>
      task.id.toString() === taskId ? { ...task, completed: !task.completed } : task,
    );

    return tasksNew;
  }

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4">
        <div className="inline-block max-w-lg text-center justify-center pb-4">
          <h1 className={title()}>{listName}</h1>
        </div>
        {!tasks && loading && (
          <Spinner className="mt-12" color="secondary" label="Loading tasks..." size="lg" variant="gradient" />
        )}
        {tasks && tasks.filter((task) => !task.completed).length !== 0 ? (
          tasks
            .filter((task) => !task.completed)
            .map((task) => (
              <div className="w-5/6" key={task.id}>
                <Task
                  key={task.id}
                  assignedUser={task.assignedUsers}
                  completed={task.completed}
                  dueDate={task.dueDate}
                  id={task.id}
                  listId={listId}
                  users={users}
                  openEditor={() => handleOpenEditor(task)}
                  title={task.title}
                  isLocked={task.isLocked}
                />
              </div>
            ))
        ) : (
          <>
            <Image alt="Image with delay" height={180} src="/noTasks.svg" width={150} />
            <span className="text-lg font-medium">All done!</span>
          </>
        )}
      </section>
      {tasks.filter((task) => task.completed).length !== 0 && (
        <section className="flex flex-col items-center justify-center ">
          <div className="w-5/6">
            <Accordion className="w-full pb-5" variant="light">
              <AccordionItem key="1" aria-label="Completed tasks" title="Completed Tasks">
                <div className="flex flex-col items-center gap-4 w-full">
                  {tasks &&
                    tasks
                      .filter((task) => task.completed)
                      .map((task) => (
                        <div className="w-full" key={task.id}>
                          <Task
                            key={task.id}
                            prevAssignedUsers={task.assignedUsers}
                            completed={task.completed}
                            dueDate={task.dueDate}
                            id={task.id}
                            listId={listId}
                            users={users}
                            openEditor={() => handleOpenEditor(task)}
                            title={task.title}
                            isLocked={task.isLocked}
                          />
                        </div>
                      ))}
                </div>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      )}
      <section className="mt-auto flex flex-col items-center py-20">
        {isInputOpen ? (
          <div ref={inputRef} className="w-5/6">
            <InputTask listId={listId} setTasks={setTasks} tasks={tasks} />
          </div>
        ) : (
          <Card className="w-5/6">
            <CardBody className="flex flex-col gap-6" onClick={() => setIsInputOpen(true)}>
              <Input
                isReadOnly
                placeholder="Add a new Task"
                startContent={<PlusIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />}
                type="text"
                variant="faded"
              />
            </CardBody>
          </Card>
        )}
      </section>

      {/* Pass the selected task and isOpen to TaskEditor */}
      {selectedTask && (
        <TaskEditor isOpen={isOpen} selectedTask={selectedTask} onOpenChange={onOpenChange} listId={listId} />
      )}
    </DefaultLayout>
  );
}
