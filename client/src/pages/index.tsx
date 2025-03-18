import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { io } from 'socket.io-client';
import { useEffect, useState, useRef } from 'react';
import { Listbox, ListboxItem, Form, Button, Input, Divider, Card, CardBody} from "@heroui/react";
import AddIcon from '@mui/icons-material/Add';
import { ListComponent } from "@/components/listComponent";
import { CreateListComponent } from "@/components/createListComponent";

const socket = io("http://localhost:4000");
const userId = 1;
export type ListData = {
  id: number;
  name: string;
  isShared: boolean;
};

export const ListboxWrapper = ({children}) => (
  <div className="w-full max-w-[260px] border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100">
    {children}
  </div>
);

export default function IndexPage() {
  const [lists, setLists] = useState<ListData[]>([]);
  const [newListName, setNewListName] = useState('');
  const [isInputOpen, setIsInputOpen] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch lists assigned to the user
    fetch('http://localhost:4000/api/lists', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'userId': userId.toString()
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log('Lists:', data);
      setLists(data);
    })
    .catch(error => console.error('Error fetching lists:', error));

  }, []);



  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <span className={title()}>Task&nbsp;</span>
          <span className={title({ color: "violet" })}>Together&nbsp;</span>
          <div className={subtitle({ class: "mt-4" })}>
            A Simple Task Manager.
          </div>
        </div>
        {lists.map(list => (
          <ListComponent key={list.id} id={list.id} name={list.name} isShared={list.isShared} />
        ))}
        
      </section>
      <section className="flex flex-col items-center py-8 md:py-10">
        {isInputOpen ? (
          <div ref={inputRef} className="w-5/6">
            <CreateListComponent setLists={setLists} lists={lists} />
          </div>
        ) : (
          <Card className="w-5/6">
            <CardBody
              className="flex flex-col gap-6"
              onClick={() => setIsInputOpen(true)}
            >
              <Input
                isReadOnly
                placeholder="Add a new List"
                startContent={
                  <AddIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                }
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