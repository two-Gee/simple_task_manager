import {React, useState } from 'react';
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Input} from "@heroui/react";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddIcon from '@mui/icons-material/Add';
import Cookies from 'js-cookie';
// TODO: Toast einbauen für Fehlermeldungen und Erfolgsmeldungen
// TODO: Farbe ggf. anpassen weil der Theme Toggle heller ist  

interface User {
    id: number;
    name: string;
}
const listId = 1;
const AddUser: React.FC = () => {
    const [userName, setUserName] = useState<string>('');

    const handleAddUser = () => {
        fetch('http://localhost:4000/api/lists/'+listId+'/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'userId': Cookies.get('userId') || ''
            },
            body: JSON.stringify({ assignedUserName: userName})
        })
        .then(response => {
            if(response.ok) {
                console.log("User added");
                return response.json();
            }else{
                console.error("Add user failed");
                return response.json();

            }  
        })
        .then(data => {
            console.log(data);
        })
    };

    return (
        <Dropdown>
        <DropdownTrigger>
          <PersonAddIcon/>
        </DropdownTrigger>
        <DropdownMenu aria-label="Static Actions"
                onClose={() => setUserName("")}
                closeOnSelect={false}>
        <DropdownItem key={"test"} startContent={<Button isIconOnly aria-label="Take a photo" color="primary" variant="faded" onPress={handleAddUser}><AddIcon /></Button>}>
            <Input
                name="listName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Add user to list"
            />
        </DropdownItem>
        </DropdownMenu >
      </Dropdown>
    );
};

export default AddUser;