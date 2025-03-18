// App.tsx
import { addToast } from "@heroui/react";
import { socket } from "@/socket";
import React from "react";


export function SocketListener() {
    React.useEffect(() => {
      socket.on("userAddedToList", (data) => {
        addToast({
          title: "Added to list",
          description: `You have been added to the list: ${data.listName}`,
          color: "success",
        });
      });
      return () => {
        socket.off("userAddedToList");
      };
    }, []);
  
    return null;
  }