


import { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Checkbox } from "@heroui/checkbox";
import { Chip } from "@heroui/chip";
import { formatDate } from "@/utils/dateFormatter";
import GroupIcon from '@mui/icons-material/Group';
import { useNavigate } from "react-router-dom"; // Import useNavigate



interface ListProps {
    id: number;
    name: string;
    isShared: boolean;
}

export const ListComponent = ({
    id,
    name, 
    isShared,
  }: ListProps) => {
    const navigate = useNavigate(); // Initialize useNavigate
    const handleCardClick = () => {
      navigate(`/list/${name}`, {state:{id}}); // Navigate to the list page with the list ID
    };
    return (
        <Card className="h-20 w-5/6">
          <CardBody
            onClick={() => {
              handleCardClick();
            }}
            className="flex flex-row justify-between items-center p-6"
            >
              <div className="flex flex-col gap-2">
                  <span className="text-base font-medium text-xl">{name}</span>
              </div>
              {(isShared == true) && (
                <div className="flex flex-col gap-2 items-end text-xl ">
                <GroupIcon />
                </div>
                )}
          </CardBody>
        </Card>
    );
  };