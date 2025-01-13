"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Loader from "@/components/Loader";
import {
    MessageSquare,
    UserPen,
    ChevronsUpDown,
    CheckIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button"; // Replace with ShadCN Button
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { fetchAgentDataByAgentId, updateAgentData } from "@/Handlers/handleDB";
import ProtectedRoute from "@/components/ProtectedRoute";

const Page = () => {
    const { id } = useParams();
    const form = useForm({
        defaultValues: {
            noOfBoxes: "",
            pickupDate: "",
            paymentDate: "",
            docketNo: "",
            paymentAmount: "",
            modeOfPayment: "",
        },
    });

    const [open, setOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [agentData, setAgentData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    const modeOfPayment = [
        { name: "Online", label: "1" },
        { name: "Cheque", label: "2" },
        { name: "Cash", label: "3" },
    ];

    const fetchAgentData = async (id) => {
        try {
            setIsLoading(true);
            const data = await fetchAgentDataByAgentId(id);
            setAgentData(data);
        } catch (error) {
            console.error("Error fetching agent data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchAgentData(id);
    }, [id]);

    const onSubmit = async (data) => {
        try {
            setIsUpdating(true);
            await updateAgentData(id, data);
            alert("Data updated successfully");
            fetchAgentData(id); // Refresh data after update
            setIsEditMode(false);
        } catch (error) {
            console.error("Error updating data:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) return <Loader message="Loading..." />;

    return (
        <ProtectedRoute>
        <div className="p-6 min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 flex flex-col gap-6">
                    <div className="p-6 rounded-lg border border-gray-200 shadow-md bg-white">
                        <Avatar className="w-24 h-24 rounded-full mx-auto">
                            <AvatarFallback className="font-bold text-3xl">
                                {agentData?.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <h2 className="mt-4 text-center text-lg font-semibold">
                            {agentData?.name || "N/A"}
                        </h2>
                        <p className="text-center text-gray-500">{agentData?.contactNo || "N/A"}</p>
                        <div className="mt-4 flex justify-center space-x-2">
                            <Button className="text-white">
                                <MessageSquare className="w-4 h-4 mr-2" /> Send Message
                            </Button>
                            <Button
                                className="bg-gray-200 text-secondary"
                                onClick={() => setIsEditMode(isEditMode => !isEditMode)}
                            >
                                <UserPen className="w-4 h-4 mr-2" /> Edit
                            </Button>
                        </div>
                    </div>

                    {isEditMode && (
                        <div className="p-6 rounded-lg border border-gray-200 shadow-md bg-white">
                            <Form {...form}>
                                <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                                    <FormField
                                        control={form.control}
                                        name="noOfBoxes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>No of Boxes</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Ex: 10" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="pickupDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Pickup Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="docketNo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Docket No</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: 001" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="paymentDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Payment Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="paymentAmount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Payment Amount</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="modeOfPayment"
                                        rules={{required: "Please select a mode of payment"}}
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Mode of Payment</FormLabel>
                                                <Popover open={open} onOpenChange={setOpen}>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                className={cn(
                                                                    "w-full justify-between",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value
                                                                    ? modeOfPayment.find((mode) => mode.name === field.value)?.name
                                                                    : "Select Mode of Payment"}
                                                                <ChevronsUpDown
                                                                    className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-full p-0">
                                                        <Command>
                                                            <CommandList>
                                                                <CommandInput
                                                                    placeholder="Search mode of payment..."/>
                                                                <CommandEmpty>No mode of payment
                                                                    found.</CommandEmpty>
                                                                <CommandGroup>
                                                                    {modeOfPayment.map((mode) => (
                                                                        <CommandItem
                                                                            value={mode.name}
                                                                            key={mode.label}
                                                                            onSelect={() => {
                                                                                form.setValue("modeOfPayment", mode.name)
                                                                                setOpen(false)
                                                                            }}
                                                                        >
                                                                            <CheckIcon
                                                                                className={cn(
                                                                                    "mr-2 h-4 w-4",
                                                                                    mode.name === field.value
                                                                                        ? "opacity-100"
                                                                                        : "opacity-0"
                                                                                )}
                                                                            />
                                                                            {mode.name}
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage>{form.formState.errors.modeOfPayment?.message}</FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="text-white w-full">
                                        {isUpdating ? "Saving..." : "Save"}
                                    </Button>
                                </form>
                            </Form>
                        </div>
                    )}
                </div>

                <div className="col-span-1 md:col-span-2">
                    <div className="p-6 rounded-lg border border-gray-200 shadow-md bg-white">
                        <h3 className="text-lg font-semibold mb-4">Deliveries</h3>
                        <div className="mt-4 overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableCell>Sr. No</TableCell>
                                        <TableCell>No of Boxes</TableCell>
                                        <TableCell>Pickup Date</TableCell>
                                        <TableCell>Docket No</TableCell>
                                        <TableCell>Payment Amount</TableCell>
                                        <TableCell>Payment Date</TableCell>
                                        <TableCell>Mode of Payment</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {agentData?.deliveries?.map((delivery, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{delivery.noOfBoxes}</TableCell>
                                            <TableCell>{delivery.pickupDate}</TableCell>
                                            <TableCell>{delivery.docketNo}</TableCell>
                                            <TableCell>{delivery.paymentAmount}</TableCell>
                                            <TableCell>{delivery.paymentDate}</TableCell>
                                            <TableCell>{delivery.modeOfPayment}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </ProtectedRoute>
    );
};

export default Page;
