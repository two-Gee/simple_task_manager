import { Input } from "@heroui/input";
import { Card, CardBody } from "@heroui/card";
import { DatePicker } from "@heroui/date-picker";
import { Form } from "@heroui/form";
import { Button } from "@heroui/button";
import { useState } from "react";
import { DateValue } from "@heroui/react";

import { PlusIcon } from "./icons";

import { TaskData } from "@/pages/list";
interface InputTaskProps {
  listId: number;
  setTasks: React.Dispatch<React.SetStateAction<TaskData[]>>;
  tasks: TaskData[];
}

export const InputTask = ({ listId, setTasks, tasks }: InputTaskProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<DateValue | null>(null);
  //   const Cookies = require("js-cookie");

  const onSubmit = async (event: {
    preventDefault: () => void;
    currentTarget: HTMLFormElement | undefined;
  }) => {
    event.preventDefault();

    setIsLoading(true);

    const data = Object.fromEntries(new FormData(event.currentTarget));

    await fetch(`http://localhost:4000/api/lists/${listId}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "userId": "1", //Cookies.get("userId"),
      },
      body: JSON.stringify({
        title: data.title,
        dueDate: data.dueDate,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setTasks(() => [...tasks, data]);
      })
      .catch((error) => console.error("Error posting task:", error));

    setTitle("");
    setDueDate(null);
    setIsLoading(false);
  };

  return (
    <Card>
      <CardBody>
        <Form className="w-full gap-6" onSubmit={onSubmit}>
          <div className="flex flex-row w-full gap-6">
            <Input
              isClearable
              isRequired
              errorMessage="Please enter a task"
              label="Task"
              labelPlacement="outside"
              name="title"
              placeholder="Add a new Task"
              startContent={
                <PlusIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
              }
              type="text"
              value={title}
              variant="faded"
              onValueChange={setTitle}
            />

            <DatePicker
              className="max-w-40"
              label="Due date"
              labelPlacement="outside"
              name="dueDate"
              selectorButtonPlacement="start"
              value={dueDate}
              variant="faded"
              onChange={(value) => setDueDate(value)}
            />
          </div>
          <div className="flex justify-center w-full">
            <Button
              className="w-1/6"
              color="secondary"
              isLoading={isLoading}
              type="submit"
              variant="solid"
            >
              Submit
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
};
