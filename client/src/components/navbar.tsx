import { Link } from "@heroui/link";
import { Navbar as HeroUINavbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import { ThemeSwitch } from "@/components/theme-switch";
import { Logo } from "./icons";
import AddUser from "./addUser";
import { useLocation } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Button } from "@heroui/button";
import Cookies from "js-cookie";
import { useUser } from "../context/UserContext";
import { Tooltip } from "@heroui/react";

export const Navbar = () => {
  const { logout } = useUser();
  const location = useLocation(); // Use useLocation to get the current route
  const username = Cookies.get("username");

  return (
    <HeroUINavbar maxWidth="full" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Tooltip
            isDisabled={location.pathname === "/"}
            content="Click to navigate home"
            showArrow={true}
            placement="bottom-start"
          >
            <Link color="foreground" href="/">
              <Logo size={70} />
            </Link>
          </Tooltip>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="end">
        {location.pathname.includes("/list") && ( // Conditionally render AddUser based on the route
          <NavbarItem className="hidden sm:flex gap-2">
            <AddUser />
          </NavbarItem>
        )}
        <NavbarItem className="hidden sm:flex gap-2">
          <Dropdown>
            <DropdownTrigger>
              <PersonIcon />
            </DropdownTrigger>
            <DropdownMenu aria-label="Dropdown menu with description" variant="faded">
              <DropdownItem key={"username"}>Logged in as: {username}</DropdownItem>
              <DropdownItem key={"logOut"}>
                <Button color="danger" fullWidth onPress={logout}>
                  Logout
                </Button>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>
      </NavbarContent>
    </HeroUINavbar>
  );
};
