import { useState, useEffect } from "react";
import { useDisclosure } from "@heroui/react";

import { title } from "@/components/primitives";
import { Task } from "@/components/task";
import DefaultLayout from "@/layouts/default";
import { TaskEditor } from "@/components/taskEditor";
import { use } from "framer-motion/client";
import { io } from 'socket.io-client';

const socket = io("http://localhost:4000"); 

export type TaskData = {
  id: number;
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

export default function ListPage({ listId = 1 }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const [tasks, setTasks] = useState<TaskData[]>([]);


  useEffect(() => {
    // Join the room with the listId
    socket.emit('joinList', listId.toString());

    // Fetch all tasks for the list
    fetch(`http://localhost:4000/api/lists/${listId}/tasks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'userId': '1'
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log(data)
      setTasks(data);
    })
    .catch(error => console.error('Error fetching tasks:', error));

    // Listen for taskAdded event
    socket.on('taskAdded', (newTask) => {
      setTasks(prevTasks => [...prevTasks, newTask]);
    });

    // Cleanup on component unmount
    return () => {
      socket.emit('leaveList', listId);
      socket.off('taskAdded');
    };
  }, [listId]);

  const handleOpenEditor = (task: TaskData) => {
    setSelectedTask(task);
    onOpen();
  };

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
        {tasks &&tasks.map(task => (
          <Task
            key={task.id}
            assignedUsers={task.assignedUsers}
            dueDate={task.dueDate}
            openEditor={() => handleOpenEditor(task)}
            title={task.title}
          />
        ))}
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
