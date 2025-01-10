'use client'
import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CardTitle } from "@/components/ui/card";
import { fetchClients } from "@/Handlers/handleDB";
import { Input } from "@/components/ui/input";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Loader from "@/components/Loader";

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [copiedClientId, setCopiedClientId] = useState('');

    useEffect(() => {
        const fetchClientsData = async () => {
            const data = await fetchClients();
            setIsLoading(false);
            setClients(data);
        };
        fetchClientsData().then(r => {});
    }, []);


    // Filter clients based on the search query
    const filteredClients = clients.filter(client => {
        return (
            client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.id
        );
    });

    const handleCopy = (id) => {
        setCopiedClientId(id);
        setTimeout(() => setCopiedClientId(''), 2000); // Reset the copied state after 2 seconds
    };

    return (
        <div className="relative p-4">
            <CardTitle className="text-3xl font-bold mb-4">Clients</CardTitle>

            {/* Search Input Field */}
            <div className="mb-4 flex justify-end">
                <Input
                    type="text"
                    placeholder="Search clients..."
                    className="p-2 border rounded w-full sm:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center mt-10">
                    <Loader message="Fetching Clients..." />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table className="mt-10 w-full">
                        <TableCaption>A list of your recent clients.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-title font-semibold text-lg">Client Id</TableHead>
                                <TableHead className="text-title font-semibold text-lg">Client Name</TableHead>
                                <TableHead className="text-title font-semibold text-lg">Company Name</TableHead>
                                <TableHead className="text-title font-semibold text-lg">Client Email</TableHead>
                                <TableHead className="text-title font-semibold text-lg">Client Address</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredClients.length > 0 ? (
                                filteredClients.map((client) => (
                                    <TableRow key={client.id}>
                                        <TableCell>
                                            <CopyToClipboard text={client.id} onCopy={() => handleCopy(client.id)}>
                                                <button className="relative group">
                                                    {client.id}
                                                    {copiedClientId === client.id && (
                                                        <span className="absolute top-[-1.5rem] left-0 bg-gray-700 text-white text-sm px-2 py-1 rounded">
                                                            Copied!
                                                        </span>
                                                    )}
                                                </button>
                                            </CopyToClipboard>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <Link className="hover:text-primary hover:underline transition-all" href={`/dashboard/clients/${client.id}`}>
                                                {client.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{client.company}</TableCell>
                                        <TableCell>{client.email}</TableCell>
                                        <TableCell>{client.address}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">No clients found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
};

export default Clients;
