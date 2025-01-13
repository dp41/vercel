'use client'
import React, { useEffect, useState } from 'react';
import {useParams, useRouter} from 'next/navigation';
import Loader from "@/components/Loader";
import { fetchClientDataByClientId } from "@/Handlers/handleDB";
import {
    MessageSquare,
    BarChart2,
    Trash2,
    MapPin,
    Plus,
    Clock, CheckCircle, EllipsisVertical, Download
} from "lucide-react";
import { Button } from "@/components/ui/button"; // Replace with ShadCN Button
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {AuthProvider} from "@/context/AuthContext"; // ShadCN Table


const Page = () => {

    const { id } = useParams();
    const router = useRouter();
    const [clientData, setClientData] = useState(null);
    const [pendingInvoicesCount, setPendingInvoicesCount] = useState(0);
    const [receivedInvoicesCount, setReceivedInvoicesCount] = useState(0);

    const fetchClientData = async () => {
        try {
            const data = await fetchClientDataByClientId(id);
            setClientData(data);

            // Count the number of "pending" and "received" invoices
            const pendingCount = data.invoices.filter(invoice => invoice.paymentStatus === "pending").length;
            const receivedCount = data.invoices.filter(invoice => invoice.paymentStatus === "received").length;

            setPendingInvoicesCount(pendingCount);
            setReceivedInvoicesCount(receivedCount);

        } catch (error) {
            console.error("Error fetching client data:", error);
        }
    };


    useEffect(() => {
        if (id) {
            fetchClientData();  // Fetch client data when 'id' changes
        }
    }, [id]);

    if (!clientData) {
        return <Loader />;
    }

    return (
        <AuthProvider>
        <div className="p-6 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <Button
                    className="text-white flex items-center"
                    onClick={() => {
                        router.push("/dashboard/generate-invoice/generate");
                    }}
                >
                    <Plus className="w-4 h-4 mr-2" /> Create Invoice
                </Button>
            </div>

            {/* Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Client Card & Address */}
                <div className="col-span-1 flex flex-col gap-6">
                    {/* Client Card */}
                    <div className="p-6 rounded-lg border border-gray-200 shadow-md bg-white">
                        <Avatar className="w-24 h-24 rounded-full mx-auto">
                            <AvatarFallback className='font-bold text-3xl '>
                                {clientData.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <h2 className="mt-4 text-center text-lg font-semibold">{clientData.name}</h2>
                        <p className="text-center text-gray-500">{clientData.email}</p>
                        <p className="text-center text-gray-500">{clientData.contactNo}</p>
                        <div className="mt-4 flex justify-center space-x-2">
                            <Button className="text-white">
                                <MessageSquare className="w-4 h-4 mr-2" /> Send Message
                            </Button>
                            <Button className="bg-gray-200 text-gray-800">
                                <BarChart2 className="w-4 h-4 mr-2" /> Analytics
                            </Button>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="p-6 rounded-lg border border-gray-200 shadow-md bg-white">
                        <h3 className="text-lg font-semibold">Address</h3>
                        <p className="mt-2 text-gray-600 flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                            {clientData.address}
                        </p>
                        <button className="mt-4 text-blue-500 underline">View map</button>
                    </div>
                </div>

                {/* Right Column: Invoice Summary */}
                <div className="col-span-1 md:col-span-2">
                    <div className="p-6 rounded-lg border border-gray-200 shadow-md bg-white">
                        <h3 className="text-lg font-semibold mb-4">Invoices</h3>

                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <div className="flex-1 text-center">
                                <h4 className="text-gray-500">Invoices Total</h4>
                                <p className="text-xl font-semibold">{clientData.invoices.length}</p>
                            </div>
                            <div className="flex-1 text-center">
                                <h4 className="text-gray-500">Paid Invoices</h4>
                                <p className="text-xl font-semibold text-green-500">
                                    {receivedInvoicesCount}
                                </p>
                            </div>
                            <div className="flex-1 text-center">
                                <h4 className="text-gray-500">Pending Invoices</h4>
                                <p className="text-xl font-semibold text-orange-500">
                                    {pendingInvoicesCount}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 overflow-x-auto">
                            <Table className="w-full table-auto border-collapse">
                                <TableHeader>
                                    <TableRow>
                                        <TableCell className="text-left font-semibold text-gray-600 py-2 px-4">Invoices</TableCell>
                                        <TableCell className="text-left font-semibold text-gray-600 py-2 px-4">Status</TableCell>
                                        <TableCell className="text-left font-semibold text-gray-600 py-2 px-4">Docket No</TableCell>
                                        <TableCell className="text-right font-semibold text-gray-600 py-2 px-4">Amount</TableCell>
                                        <TableCell className="text-center font-semibold text-gray-600 py-2 px-4">Download</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clientData.invoices.map((invoice, index) => (
                                        <TableRow key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                            <TableCell className="py-3 px-4">{invoice.invoiceNo}</TableCell>
                                            <TableCell className="py-3 px-4">
                    <span
                        className={`px-3 py-1 rounded-full inline-flex items-center ${
                            invoice.paymentStatus === "pending"
                                ? 'bg-red-100 text-red-600'
                                : invoice.paymentStatus === "received"
                                    ? 'bg-green-100 text-green-600'
                                    : "bg-red-500"
                        }`}
                    >
                        {invoice.paymentStatus === "pending" && (
                            <Clock className="mr-2 mt-1" size={15} />
                        )}
                        {invoice.paymentStatus === "received" && (
                            <CheckCircle className="mr-2 mt-1" size={15} />
                        )}
                        {invoice.paymentStatus}
                    </span>
                                            </TableCell>
                                            <TableCell className="py-3 px-4">{invoice.docketNo}</TableCell>
                                            <TableCell className="py-3 px-4 text-right">₹{invoice.paymentAmount}</TableCell>
                                            <TableCell className="py-3 px-4">
                                                <div className="flex justify-center items-center">
                                                    <Download className="w-4 h-4 text-red-500 cursor-pointer" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 px-4">
                                                <div className="flex justify-center items-center">
                                                    {/*<Trash2 className="w-4 h-4 text-red-500 cursor-pointer" />*/}
                                                    <EllipsisVertical className="w-4 h-4 text-red-500 cursor-pointer" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </AuthProvider>
    );
};

export default Page;

