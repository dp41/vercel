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
import {fetchAgents} from "@/Handlers/handleDB";
import { Input } from "@/components/ui/input";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Loader from "@/components/Loader";
import Link from "next/link";
import {AuthProvider} from "@/context/AuthContext";

const Clients = () => {
    const [agents, setAgents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [copiedAgentId, setCopiedAgentId] = useState('');


    useEffect(() => {
        const fetchAgentsData = async () => {
            const data = await fetchAgents();
            setIsLoading(false);
            setAgents(data);
        };
        fetchAgentsData();
    }, []);

    // Filter clients based on the search query
    const filteredAgents = agents.filter(agent => {
        return (
            agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.id
        );
    });

    const handleCopy = (id) => {
        setCopiedAgentId(id);
        setTimeout(() => setCopiedAgentId(''), 2000); // Reset the copied state after 2 seconds
    };

    return (
        <AuthProvider>
        <div className="relative p-4">
            <CardTitle className="text-3xl font-bold mb-4">Agents</CardTitle>

            {/* Search Input Field */}
            <div className="mb-4 flex justify-end">
                <Input
                    type="text"
                    placeholder="Search agents..."
                    className="p-2 border rounded w-full sm:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {isLoading ? (
                <Loader message="Fetching Agents..." />
            ) : (
                <div className="overflow-x-auto">
                    <Table className="mt-10 w-full">
                        <TableCaption>A list of your recent agents.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-title font-semibold text-lg">Id</TableHead>
                                <TableHead className="text-title font-semibold text-lg">Name</TableHead>
                                <TableHead className="text-title font-semibold text-lg">Contact No</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAgents.length > 0 ? (
                                filteredAgents.map((agent) => (
                                    <TableRow key={agent.id}>
                                        <TableCell>
                                            <CopyToClipboard text={agent.id} onCopy={() => handleCopy(agent.id)}>
                                                <button className="relative group">
                                                    {agent.id}
                                                    {copiedAgentId === agent.id && (
                                                        <span className="absolute top-[-1.5rem] left-0 bg-gray-700 text-white text-sm px-2 py-1 rounded">
                                                            Copied!
                                                        </span>
                                                    )}
                                                </button>
                                            </CopyToClipboard>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <Link className="hover:text-primary hover:underline transition-all" href={`/dashboard/agents/${agent.id}`}>
                                            {agent.name}
                                        </Link>
                                        </TableCell>
                                        <TableCell>{agent.contactNo}</TableCell>
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
        </AuthProvider>
    );
};

export default Clients;
