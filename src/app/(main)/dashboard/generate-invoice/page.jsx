'use client';
import React, { useEffect, useState } from 'react';
import { fetchClients } from '@/Handlers/handleDB';
import { Plus, RefreshCw, ChevronDown, Clock, CheckCircle, Calendar as CalendarIcon, Search } from 'lucide-react';
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Input} from "@/components/ui/input";
import {Table, TableBody, TableCell, TableHeader, TableRow} from "@/components/ui/table";
import {Calendar} from "@/components/ui/calendar";
import {useRouter} from "next/navigation";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {AuthProvider} from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

const Page = () => {
    const [clientData, setClientData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDateRange, setSelectedDateRange] = useState(null);
    const router = useRouter();
    const fetchClientData = async () => {
        try {
            const data = await fetchClients();
            setClientData(data);
        } catch (error) {
            console.error('Error fetching client data:', error);
        }
    };

    const filterInvoices = (invoice) => {
        const matchesQuery = invoice.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDate =
            !selectedDateRange ||
            (new Date(invoice.date) >= new Date(selectedDateRange.start) &&
                new Date(invoice.date) <= new Date(selectedDateRange.end));

        return matchesQuery && matchesDate;
    };

    useEffect(() => {
        fetchClientData();
    }, []);

    return (
        <ProtectedRoute>
        <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">Invoices</h1>
                <Button className="flex items-center text-white" onClick={() => {router.push('/dashboard/generate-invoice/generate')}}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create an Invoice
                </Button>
            </div>

            {/* Filter Section */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button className="bg-gray-200 text-gray-700">
                                <CalendarIcon className="w-4 h-4 mr-2"/>
                                Select Date Range
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                            <Calendar
                                mode="range"
                                onSelect={(range) => setSelectedDateRange(range)}
                                className="w-full"
                            />
                        </PopoverContent>
                    </Popover>
                    <div className="relative">
                        <div className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">
                            <Search className="w-4 h-4 text-gray-800"/>
                        </div>
                        <Input
                            placeholder="Search by Invoice no"
                            className="w-full rounded-lg bg-background pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Clear Filters Button - adjusted to not take full width */}
                <Button
                    onClick={() => {
                        setSearchQuery('');
                        setSelectedDateRange(null);
                    }}
                    className="bg-gray-200 text-gray-700 w-auto"
                >
                    <RefreshCw className="w-4 h-4 mr-2"/>
                    Clear Filters
                </Button>
            </div>

                    {/* Table Section */}
                    <div className="bg-white shadow-sm rounded-lg p-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableCell className="font-bold text-sm sm:text-base">Number</TableCell>
                                    <TableCell className="font-bold text-sm sm:text-base">Status</TableCell>
                                    <TableCell className="font-bold text-sm sm:text-base">Date</TableCell>
                                    <TableCell className="font-bold text-sm sm:text-base">Customer</TableCell>
                                    <TableCell className="font-bold text-sm sm:text-base text-right">Total</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clientData.map((client) =>
                                        client.invoices
                                            .filter(filterInvoices)
                                            .map((invoice) => (
                                                <TableRow key={invoice.invoiceNo} className="hover:bg-gray-50">
                                                    <TableCell className="text-sm sm:text-base">{invoice.invoiceNo}</TableCell>
                                                    <TableCell className="text-sm sm:text-base">
                            <span
                                className={`px-3 py-1 rounded-full inline-flex items-center ${
                                    invoice.paymentStatus === 'received'
                                        ? 'bg-green-100 text-green-600'
                                        : invoice.paymentStatus === 'pending'
                                            ? 'bg-red-100 text-red-600'
                                            : 'bg-yellow-100 text-yellow-600'
                                }`}
                            >
                                {invoice.paymentStatus === 'pending' && (
                                    <Clock className="mr-2 mt-1" size={15} />
                                )}
                                {invoice.paymentStatus === 'received' && (
                                    <CheckCircle className="mr-2 mt-1" size={15} />
                                )}
                                {invoice.paymentStatus}
                            </span>
                                                    </TableCell>
                                                    <TableCell className="text-sm sm:text-base">{invoice.date}</TableCell>
                                                    <TableCell className="flex items-center space-x-3 text-sm sm:text-base">
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarFallback className="font-bold">
                                                                {client.name.charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span>{client.name}</span>
                                                    </TableCell>
                                                    <TableCell className="text-right text-sm sm:text-base">
                                                        ₹{invoice.paymentAmount}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                )}
                            </TableBody>
                        </Table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-gray-600">Showing 10 of 800 results</p>
                <Button className="text-white">
                    Show More
                    <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
        </ProtectedRoute>
    );
};

export default Page;
