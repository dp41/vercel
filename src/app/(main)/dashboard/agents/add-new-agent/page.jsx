'use client'
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {checkAgentExistsById, saveAgentData} from "@/Handlers/handleDB";

const AddAgent = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false); // Loading state
    const form = useForm({
        defaultValues: {
            id: "",
            agentName: "",
            state:'',
            agentContactNo: "",
        },
        mode: "onBlur",
    });

    const onSubmit = async (data) => {
        setLoading(true); // Start loading

        try {
            if(!await checkAgentExistsById(data.id)){
                await saveAgentData(data)
                alert("Agent added successfully!");
                toast({
                    title: "Success",
                    description: "Agent added successfully!",
                });
                form.reset(); // Clear the form after successful submission
            }else{
                alert("Agent with same id already exists. Please use a different id.");
            }

        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add agent. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false); // End loading
        }
    };

    // Function to copy the clientId to clipboard

    return (
        <div className="w-full p-4 flex justify-center">
            <div className="w-full sm:w-[500px] md:w-[600px] lg:w-[700px] xl:w-[800px] p-4">
                <CardTitle className="text-3xl font-bold mb-4">Add New Agent</CardTitle>
                <Form {...form}>
                    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                        {/*id field*/}
                        <FormField
                            control={form.control}
                            name="id"
                            rules={{ required: "Id is required" , pattern: { value: /^[0-9]+$/, message: "Id must contain only numbers" }}}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Agent Id</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Ex: 001" {...field} />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.id?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        {/* Name field */}
                        <FormField
                            control={form.control}
                            name="agentName"
                            rules={{ required: "Name is required" , pattern: { value: /^[a-zA-Z\s]+$/, message: "Name must contain only alphabetic characters" }}}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Agent Name</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Ex: John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.agentName?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        {/* Name field */}
                        <FormField
                            control={form.control}
                            name="state"
                            rules={{ required: "State is required" , pattern: { value: /^[a-zA-Z\s]+$/, message: "Name must contain only alphabetic characters" }}}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Working State</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Ex: Gujarat" {...field} />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.state?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        {/* Contact No field */}
                        <FormField
                            control={form.control}
                            name="agentContactNo"
                            rules={{
                                required: "Contact number is required",
                                pattern: {
                                    value: /^\d{10}$/,
                                    message: "Contact number must be of 10 digits",
                                },
                            }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Agent Contact No</FormLabel>
                                    <FormControl>
                                        <Input type="tel" placeholder="Ex: 1234567890" {...field} />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.agentContactNo?.message}</FormMessage>
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
    );
};

export default AddAgent;
