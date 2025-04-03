import { Input } from "@heroui/input";
import { Card, CardBody } from "@heroui/card";
import { Form } from "@heroui/form";
import { Button } from "@heroui/button";
import { useState } from "react";
import { PlusIcon } from "./icons";
import { ListData } from "@/pages";
import Cookies from "js-cookie";

interface CreateListProps {
  setLists: React.Dispatch<React.SetStateAction<ListData[]>>;
  lists: ListData[];
  closeInput: () => void;
}

export const CreateListComponent = ({ setLists, lists, closeInput }: CreateListProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const onSubmit = async (event: { preventDefault: () => void; currentTarget: HTMLFormElement | undefined }) => {
    event.preventDefault();

    setIsLoading(true);

    const data = Object.fromEntries(new FormData(event.currentTarget));

    fetch("http://localhost:4000/api/lists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        userId: Cookies.get("userId"),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("New list created:", data);
        setLists([...lists, data]);
        closeInput();
        setName("");
      })
      .catch((error) => console.error("Error creating list:", error))
      .finally(() => setIsLoading(false));
  };

  return (
    <Card>
      <CardBody>
        <Form className="w-full gap-6" onSubmit={onSubmit}>
          <div className="flex flex-row w-full gap-6">
            <Input
              autoFocus
              isRequired
              errorMessage="Please enter a list name"
              label="List"
              labelPlacement="outside"
              name="name"
              placeholder="Add a new List"
              startContent={<PlusIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />}
              type="text"
              value={name}
              variant="faded"
              onValueChange={setName}
            />
          </div>
          <div className="flex justify-center w-full">
            <Button className="w-1/6" color="secondary" isLoading={isLoading} type="submit" variant="solid">
              Submit
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
};
