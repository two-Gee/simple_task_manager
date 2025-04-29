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
import { TaskEditor, unlockTask } from "@/components/taskEditor";
import { InputTask } from "@/components/inputTask";
import { PlusIcon } from "@/components/icons";
import { useClickOutside } from "@/hooks/useClickOutside";
import { socket } from "@/socket";
import AddUser from "@/components/addUser";

export type TaskData = {
  id: number;
  title: string;
  dueDate?: string;
  completed?: boolean;
  assignedUsers?: User[];
  isLocked: boolean;
  isTempCompleted?: boolean;
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
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onBeforeUnload = () => {
      if (selectedTask?.id !== undefined) {
        unlockTask(selectedTask.id, listId);
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [selectedTask]);

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
      // Step 1: mark the task as temp-completed but not fully completed yet
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id.toString() === taskId
            ? {
                ...task,
                isTempCompleted: task.completed ? false : true,
                completed: !task.completed ? task.completed : !task.completed,
              }
            : task,
        ),
      );

      // Step 2: after a delay, mark it truly completed
      setTimeout(() => {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id.toString() === taskId
              ? { ...task, completed: task.isTempCompleted ? !task.completed : task.completed, isTempCompleted: false }
              : task,
          ),
        );
      }, 1000); // 2-second delay
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

    socket.on("taskUpdated", (updatedTask) => {
      setTasks((prevTasks) => updateTasks(prevTasks, updatedTask));
    });

    socket.on("taskLocked", ({ taskId }) => {
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) => {
          if (task.id.toString() === taskId) {
            task.isLocked = true;
          }
          return task;
        });
        return updatedTasks;
      });
    });

    socket.on("taskUnlocked", ({ taskId }) => {
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) => {
          if (task.id.toString() === taskId) {
            task.isLocked = false;
          }
          return task;
        });
        return updatedTasks;
      });
    });

    // Cleanup on component unmount
    return () => {
      socket.emit("leaveList", listId);
      socket.off("taskAdded");
      socket.off("taskCompleted");
      socket.off("newUserAssignedToList");
      socket.off("taskDeleted");
      socket.off("taskAssigned");
      socket.off("taskUnassigned");
      socket.off("taskUpdated");
      socket.off("taskLocked");
      socket.off("taskUnlocked");
    };
  }, [listId]);

  const handleOpenEditor = (task: TaskData) => {
    lockTask(task.id);
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

  const lockTask = (taskId: number) => {
    console.log("Locking task", taskId);
    fetch(`http://localhost:4000/api/lists/${listId}/tasks/${taskId}/lock`, {
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
      .catch((error) => console.error("Error locking task:", error));
  };

  function updateTasks(tasks: TaskData[], updatedTask: TaskData) {
    let tasksNew = tasks.map((task) =>
      task.id === updatedTask.id ? { ...task, dueDate: updatedTask.dueDate, title: updatedTask.title } : task,
    );

    return tasksNew;
  }

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-row items-center justify-between w-5/6 pb-4">
          <h1 className={`${title()} text-center flex-grow`}>{listName}</h1>
          <AddUser className="flex-shrink-0" />
        </div>
        {!tasks && loading && (
          <Spinner className="mt-12" color="secondary" label="Loading tasks..." size="lg" variant="gradient" />
        )}
        {tasks && tasks.filter((task) => !task.completed || task.isTempCompleted).length !== 0 ? (
          tasks
            .filter((task) => !task.completed || task.isTempCompleted)
            .map((task) => (
              <div className="w-5/6" key={task.id}>
                <Task
                  key={task.id}
                  assignedUser={task.assignedUsers}
                  completed={task.completed}
                  isTempCompleted={task.isTempCompleted}
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
                      ))}
                </div>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      )}
      <section className="mt-auto flex flex-col items-center py-20">
        <div ref={inputRef} className="w-5/6">
          <InputTask listId={listId} setTasks={setTasks} tasks={tasks} />
        </div>
      </section>

      {/* Pass the selected task and isOpen to TaskEditor */}
      {selectedTask && (
        <TaskEditor
          isOpen={isOpen}
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
          onOpenChange={onOpenChange}
          listId={listId}
        />
      )}
    </DefaultLayout>
  );
}
