import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { useEffect, useState, useRef } from "react";
import { Input, Card, CardBody, addToast } from "@heroui/react";
import AddIcon from "@mui/icons-material/Add";
import { ListComponent } from "@/components/listComponent";
import { CreateListComponent } from "@/components/createListComponent";
import { socket } from "@/socket";
import Cookies from "js-cookie";
import { useClickOutside } from "@/hooks/useClickOutside";

export type ListData = {
  id: number;
  name: string;
  isShared: boolean;
};

export default function IndexPage() {
  const [lists, setLists] = useState<ListData[]>([]);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string | undefined>(Cookies.get("userId"));

  // Use custom hook to close the task input when clicking outside
  useClickOutside(inputRef, () => {
    setIsInputOpen(false);
  });

  useEffect(() => {
    setUserId(Cookies.get("userId"));
    socket.emit("joinList", userId);

    socket.on("assignedToList", (newList) => {
      console.log("Assigned to new list:", newList);
      setLists((prevLists) => [...prevLists, newList]);
      addToast({
        title: "Added to new list",
        description: "You have been added to the list: " + newList.name,
        color: "success",
      });
    });
    // Fetch lists assigned to the user
    fetch("http://localhost:4000/api/lists", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        userId: userId || "",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Lists:", data);
        setLists(data);
      })
      .catch((error) => console.error("Error fetching lists:", error));
    return () => {
      socket.off("assignedToList");
      socket.off("joinList");
    };
  }, []);

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <span className={title()}>Task&nbsp;</span>
          <span className={title({ color: "violet" })}>Together</span>
          <div
            className={subtitle({
              class: "mt-4",
            })}
          >
            A Simple Task Manager.
          </div>
        </div>
        {lists.map((list) => (
          <ListComponent key={list.id} id={list.id} name={list.name} isShared={list.isShared} />
        ))}
      </section>
      <section className="flex flex-col items-center py-8 md:py-10">
        {isInputOpen ? (
          <div ref={inputRef} className="w-5/6">
            <CreateListComponent setLists={setLists} lists={lists} closeInput={() => setIsInputOpen(false)} />
          </div>
        ) : (
          <Card className="w-5/6">
            <CardBody className="flex flex-col gap-6" onClick={() => setIsInputOpen(true)}>
              <Input
                isReadOnly
                placeholder="Add a new List"
                startContent={<AddIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />}
                type="text"
                variant="faded"
              />
            </CardBody>
          </Card>
        )}
      </section>
    </DefaultLayout>
  );
}
