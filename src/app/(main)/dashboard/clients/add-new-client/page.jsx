'use client'
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {checkClientExistsById, saveClientData} from "@/Handlers/handleDB";
import {AuthProvider} from "@/context/AuthContext";

const AddNewClient = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false); // Loading state
    const form = useForm({
        defaultValues: {
            id: "",
            name: "",
            email: "",
            contactNo: "",
            company: "",
            gstNo: "",
            address: "",
        },
        mode: "onBlur",
    });

    const onSubmit = async (data) => {
        setLoading(true); // Start loading

        try {
            if(!await checkClientExistsById(data.id)){
                await saveClientData(data)
                alert("Client added successfully!");
                toast({
                    title: "Success",
                    description: "Client added successfully!",
                });
                form.reset(); // Clear the form after successful submission
            }else{
                alert("Client with same id already exists. Please use a different id.");
            }

        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add client. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false); // End loading
        }
    };

    // Function to copy the clientId to clipboard

    return (
        <AuthProvider>
        <div className="w-full p-4 flex justify-center">
            <div className="w-full sm:w-[500px] md:w-[600px] lg:w-[700px] xl:w-[800px] p-4">
                <CardTitle className="text-3xl font-bold mb-4">Add New Client</CardTitle>
                <Form {...form}>
                    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                        {/*id field*/}
                        <FormField
                            control={form.control}
                            name="id"
                            rules={{ required: "Id is required" , pattern: { value: /^[0-9]+$/, message: "Id must contain only numbers" }}}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Client Id</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Ex: 001" {...field} />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.id?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        {/*company name*/}
                        <FormField
                            control={form.control}
                            name="company"
                            rules={{ required: "Company is required" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Name</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Ex: Airex Logistics" {...field} />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.address?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        {/* Name field */}
                        <FormField
                            control={form.control}
                            name="name"
                            rules={{ required: "Name is required" , pattern: { value: /^[a-zA-Z\s]+$/, message: "Name must contain only alphabetic characters" }}}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Client Name</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Ex: John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.name?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        {/*GST No*/}
                        <FormField
                            rules={{
                                required: "GST No is required",
                                pattern: {
                                    value: /^[0-9]{2}[A-Z0-9]{10}[1-9A-Z]Z[A-Z0-9]{1}$/,
                                    message: "Invalid GST No"
                                },
                            }}
                            control={form.control}
                            name="gstNo"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>GST No</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: 24ABCDE1234F1Z5" type="text" {...field}
                                               className="w-full"/>
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.gstNo?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        {/* Email field */}
                        <FormField
                            control={form.control}
                            name="email"
                            rules={{
                                required: "Email is required",
                                pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                                    message: "Invalid email address",
                                },
                            }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Client Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="Ex: john@gmail.com" {...field} />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.email?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        {/* Contact No field */}
                        <FormField
                            control={form.control}
                            name="contactNo"
                            rules={{
                                required: "Contact number is required",
                                pattern: {
                                    value: /^\d{10}$/,
                                    message: "Contact number must be of 10 digits",
                                },
                            }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Client Contact No</FormLabel>
                                    <FormControl>
                                        <Input type="tel" placeholder="Ex: 1234567890" {...field} />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.contactNo?.message}</FormMessage>
                                </FormItem>
                            )}
                        />


                        {/* Address field */}
                        <FormField
                            control={form.control}
                            name="address"
                            rules={{ required: "Address is required" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Client Address</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Ex: 123 Main St, City, Country" {...field} />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.address?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <div className="text-right">
                            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                                {loading ? "Submitting..." : "Submit"}
                            </Button>
                        </div>
                    </form>
                </Form>

            </div>
        </div>
        </AuthProvider>
    );
};

export default AddNewClient;
