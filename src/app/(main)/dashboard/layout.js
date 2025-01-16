'use client'
import React, { useEffect, useState } from 'react';
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { usePathname, useRouter } from "next/navigation"; // Use useRouter for client-side navigation
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {useAuth} from "@/lib/AuthContext";
import Loader from "@/components/Loader";

const Layout = ({ children }) => {
    const pathname = usePathname();  // Get pathname using usePathname
    const router = useRouter();  // Use the router hook for client-side navigation
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    const {user, loading} = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);


    useEffect(() => {
        if (pathname) {
            const pathSegments = pathname.split('/').filter(Boolean); // Remove empty segments

            const newBreadcrumbs = pathSegments.map((segment, index) => {
                const fullPath = `/${pathSegments.slice(0, index + 1).join('/')}`;
                return {
                    name: segment.charAt(0).toUpperCase() + segment.slice(1), // Capitalize first letter
                    path: fullPath
                };
            });

            setBreadcrumbs(newBreadcrumbs);
        }
    }, [pathname]);  // Re-run effect when path changes

    const handleMenuItemClick = (route) => {
        router.push(route); // Use router.push for client-side navigation (no page refresh)
    };

    // Handle breadcrumb click to navigate without page refresh
    const handleBreadcrumbClick = (e, path) => {
        e.preventDefault();  // Prevent the default anchor behavior
        router.push(path);   // Use router.push for client-side navigation
    };

    if (loading) {
        return <Loader message={'Please wait...'} />
    }
    return (
        <SidebarProvider>
            <AppSidebar  setIsSelectedItem={handleMenuItemClick} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            {breadcrumbs.length > 0 && breadcrumbs.map((breadcrumb, index) => (
                                <React.Fragment key={breadcrumb.path}>
                                    <BreadcrumbItem className={index === breadcrumbs.length - 1 ? "font-semibold" : ""}>
                                        <BreadcrumbLink
                                            href={breadcrumb.path}
                                            onClick={(e) => handleBreadcrumbClick(e, breadcrumb.path)} // Handle client-side navigation for breadcrumbs
                                        >
                                            {breadcrumb.name}
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    {index < breadcrumbs.length - 1 && (
                                        <BreadcrumbSeparator />
                                    )}
                                </React.Fragment>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>
                <div className="p-4">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default Layout;
