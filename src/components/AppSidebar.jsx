'use client'
import * as React from "react";
import {
    Calendar,
    FileText,
    UserPlus,
    Users,
    FileSignature,
    DollarSign,
    Package,
    Home,
    UserRoundPlus,
    UsersRound,
    ChevronDown,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent, SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem, SidebarRail,
} from "@/components/ui/sidebar";
import Image from "next/image";
import {useEffect, useState} from "react";
import {signOut } from "firebase/auth";
import { LogOut } from 'lucide-react';
import {auth, onAuthStateChanged} from "@/lib/firebase";
import {useRouter} from "next/navigation";

export function AppSidebar({ setIsSelectedItem, isSidebarOpen, toggleSidebar }) {

    const menuItems = [
        { name: "Dashboard", icon: Home, path: `/dashboard` },
        { name: "Booking", icon: Calendar, path: `/dashboard/booking` },
        {
            name: "Generate Invoice", icon: FileText, path: "/dashboard/generate-invoice",
            subItems: [
                { name: "Show Invoices", path: "/dashboard/generate-invoice/" },
                { name: "Generate Invoice", path: "/dashboard/generate-invoice/generate" },
            ]
        },
        { name: "Clients", icon: Users, path: "/dashboard/clients",
            subItems: [
                { name: "Show Clients", icon: Users, path: "/dashboard/clients/" },
                { name: "Add New Client", icon: UserPlus, path: "/dashboard/clients/add-new-client" },
            ]},
        { name: "Agents", icon: UsersRound, path: "/dashboard/agents",
            subItems: [
                { name: "Show Agents", icon: UsersRound, path: "/dashboard/agents/" },
                { name: "Add New Agent", icon: UserRoundPlus, path: "/dashboard/agents/add-new-agent" },
            ]},
        { name: "Create Quotation", icon: FileSignature, path: "/dashboard/quotation" },
        { name: "Payment Records", icon: DollarSign, path: "/dashboard/payment-records" },
        { name: "Tracking Goods", icon: Package, path: "/dashboard/tracking" },
    ];


    // State to track which menu is open and selected
    const [openMenu, setOpenMenu] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [userEmail, setUserEmail] = useState(null);
    const router = useRouter();

    useEffect(() => {
        // Listen for authentication state changes
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserEmail(user.email); // Set the user's email when logged in
            } else {
                setUserEmail(null); // Clear the email when logged out
            }
        });

        // Clean up the listener when the component is unmounted
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Get the logged-in user's email
        const user = auth.currentUser;
        if (user) {
            setUserEmail(user.email);
        }
    }, [auth.currentUser]);

    const handleLogout = async () => {
        try {
            // Sign out the user first
            await signOut(auth);

            // Clear authentication-related cookies (replace 'isLoggedIn' with your actual cookie names)
            document.cookie = "isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";

            // Clear email state
            setUserEmail(null);

            // Redirect to the login page after sign-out and cookie clearing
            router.push('/login');
        } catch (error) {
            console.error("Error logging out: ", error);
        }
    };

    const handleMenuClick = (item) => {
        // Toggle the selected menu item, close others
        setOpenMenu(openMenu === item.name ? null : item.name);
    };

    const handleItemSelect = (item) => {
        // Mark the item as selected
        setSelectedItem(item.path);
        setIsSelectedItem(item.path); // Optional: Set the item path to the parent component
    };

    return (
        <Sidebar className="h-screen overflow-hidden bg-gray-100">
            <SidebarHeader>
                <div className="flex items-center gap-2 px-4 py-2">
                    <Image src="/Images/logo.png" alt="Logo" width={200} height={200} />
                </div>
            </SidebarHeader>
            <SidebarContent className="m-3 overflow-y-auto overflow-x-hidden">
                <SidebarMenu>
                    {menuItems.map((item) => (
                        <div key={item.name}>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={() => {
                                        if (item.subItems) {
                                            handleMenuClick(item); // Toggle sub-menu for items with subItems
                                        } else {
                                            handleItemSelect(item); // Set the selected item
                                        }
                                    }}
                                    className={`${
                                        selectedItem === item.path ? "bg-primary text-white" : ""
                                    }`} // Add selected styling
                                >
                                    <item.icon className="mr-3 h-5 w-5" />
                                    <span className="text-title font-semibold">{item.name}</span>
                                    {item.subItems && (
                                        <ChevronDown
                                            className={`h-5 w-5 transform transition-transform ${
                                                openMenu === item.name ? "rotate-180" : ""
                                            }`}
                                        />
                                    )}
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* Check if item has sub-items and is open */}
                            {item.subItems && openMenu === item.name && (
                                <div className="pl-12">
                                    {item.subItems.map((subItem) => (
                                        <SidebarMenuItem key={subItem.name}>
                                            <SidebarMenuButton
                                                onClick={() => handleItemSelect(subItem)} // Set the selected item for subItems
                                                className={`${
                                                    selectedItem === subItem.path ? "bg-primary text-white" : ""
                                                }`} // Add selected styling for sub-items
                                            >
                                                <span className="text-title">{subItem.name}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                {userEmail && (
                    <div className="flex items-center justify-between p-3 rounded-lg shadow-md">
                        <span className="mr-3 text-sm font-medium text-gray-700 truncate">
                            {userEmail}
                        </span>
                        <LogOut className="cursor-pointer text-red-600 text-lg transition-colors duration-300 hover:text-red-700"
                                onClick={handleLogout}/>
                    </div>
                )}
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    );
}
