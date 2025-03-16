import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import { Listbox, ListboxItem, Form, Button, Input, Divider } from "@heroui/react";
import AddIcon from '@mui/icons-material/Add';

const socket = io("http://localhost:4000");
const userId = 1;

export const ListboxWrapper = ({children}) => (
  <div className="w-full max-w-[260px] border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100">
    {children}
  </div>
);

export default function IndexPage() {
  const [lists, setLists] = useState<{ id: number, name: string }[]>([]);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    // Fetch lists assigned to the user
    fetch('http://localhost:4000/api/lists?userId=' + userId.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log('Lists:', data);
      setLists(data);
    })
    .catch(error => console.error('Error fetching lists:', error));

  }, []);

  const createList = () => {
    fetch('http://localhost:4000/api/lists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: newListName, userId })
    })
    .then(response => response.json())
    .then(data => {
      console.log('New list created:', data);
      setLists([...lists, data]);
      setNewListName('');
    })
    .catch(error => console.error('Error creating list:', error));
  };

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

        <ListboxWrapper>
        
          <Listbox aria-label="Assigned Lists">
            {lists.map(list => (
              <ListboxItem key={list.id}>{list.name}</ListboxItem>
            ))}
          </Listbox>
          <Divider />
          <div className="flex gap-2 pt-4">
            <Button isIconOnly aria-label="Take a photo" color="primary" variant="faded" onPress={createList}>
              <AddIcon />
            </Button>
            <Input
              name="listName"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Add new list"
            />
          </div>
        </ListboxWrapper>

      </section>
    </DefaultLayout>
  );
}