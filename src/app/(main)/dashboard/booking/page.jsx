'use client'

import React, {useState, useEffect, useRef} from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command"
import { CheckIcon, ChevronsUpDown } from 'lucide-react'
import { cn } from "@/lib/utils"
import {bookingModel} from "@/models/bookingModel";
import {
    checkBookingExistsByDocketNo,
    checkClientExistsById,
    fetchAgents,
    saveBookingData,
    saveInvoiceData, saveProfitData, updateAgentData
} from "@/Handlers/handleDB";
import Loader from "@/components/Loader";
import {profitModel} from "@/models/profitModel";
import {AuthProvider} from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";


const NewBooking = () => {
    const [open, setOpen] = useState(false)
    const isUpdating = useRef(false); // Flag to prevent recursion
    const [isLoading, setIsLoading] = useState(false);
    const [agents, setAgents] = useState([]);
    const [profit, setProfit] = useState(0);
    const form = useForm({
        defaultValues: {
            clientId: '',
            docketNo: '',
            bookingDate: '',
            pickupDate:'',
            source: '',
            destination: '',
            agentId: '',
            consignor: '',
            consignee: '',
            transportationMode: '',
            trainNumber: '',
            leaseNumber: '',
            railwayReceipt:'',
            roadTransporterName: '',
            vehicleNumber: '',
            awbNo: '',
            airTransporterName:'',
            eWayBillNo: '',
            okwardDeliveryAmount: '',
            consigneeName: '',
            consigneeAddress: '',
            city: '',
            state:'',
            stateCode: '',
            gstNo: '',
            paymentDoneBy: '',
            paymentStatus: '',
            items: [{ docketNo: '', boxQuantity: 0, chargedWeight: 0, ratePerKg: 0, netValue: 0, sgst: 0, cgst: 0, igst: 0}],
            bookingCharge: '',
            deliveryCharge: '',
            commissionAmount: '',
            commissionPercentage: '',
            commissionPerson: '',
            gstPercentage: '',
            gst: '',
            profit: '',
            totalAmount: '',
            totalAmountWithTax: '',
            totalNetValue: '',
            totalSgst: '',
            totalCgst: '',
            totalIgst: '',
            hasCommission: false,
            hasODA: false,
            hasAgent: false,
            hasRailwayReceipt: false
        },
    })


    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    const onSubmit = async (data) => {
        setIsLoading(true);

        // structure data
        const dataObj = bookingModel(data);
        const profitData = profitModel(dataObj, profit);

        if(await checkClientExistsById(dataObj.clientId)){

            if(!await checkBookingExistsByDocketNo(data.docketNo)){
                // if(data.hasAgent){
                //     await updateAgentData(data.agentId, data);
                // }
                await saveBookingData(dataObj);
                await saveProfitData(profitData);

                // Simulate the booking process
                setTimeout(() => {
                    alert("Booking added successfully!");

                    // Stop loading after alert is dismissed
                    setTimeout(() => {
                        setIsLoading(false);
                    }, 0); // Set to 0ms to immediately execute after the alert
                }, 3000); // Simulate a 3-second booking process

                form.reset();
            }else{
                alert("Docket number already exists. Please use a different docket number.");
            }
        } else{
            alert("Client does not exist");
        }
        setIsLoading(false)


    };

    const calculateTotals = () => {
        const values = form.getValues();

        let totalNetValue = 0;
        let totalSgst = 0;
        let totalCgst = 0;
        let totalIgst = 0;
        let taxPercentage = 0;
        let igstPercentage = 0;

        if(values.gstPercentage === "5"){
            taxPercentage = 0.025;
        }else if(values.gstPercentage === "18"){
            taxPercentage = 0.09;
        }else if(values.gst === "IGST"){
            igstPercentage = 0.18;
        }
        const updatedItems = (values.items || []).map(item => {
            const itemNetValue = (item.chargedWeight || 0) * (item.ratePerKg || 0);
            const itemSgst = itemNetValue * taxPercentage;
            const itemCgst = itemNetValue * taxPercentage;
            const itemIgst = itemNetValue * igstPercentage;

            totalNetValue += itemNetValue;
            totalSgst += itemSgst;
            totalCgst += itemCgst;
            totalIgst += itemIgst;

            return {
                ...item,
                netValue: itemNetValue,
                sgst: itemSgst,
                cgst: itemCgst,
                igst: itemIgst,
            };
        });

        // Prevent recursion by setting the flag
        isUpdating.current = true;

        form.setValue('items', updatedItems);

        let totalAmount = totalNetValue;
        let totalAmountWithTax = totalAmount + totalSgst + totalCgst + totalIgst;
        let commissionAmount = 0;

        setProfit(totalAmount - ((values.bookingCharge || 0) + (values.deliveryCharge || 0)))


        // Add awkward delivery amount (ODA) if applicable
        if (values.hasODA) {
            totalAmountWithTax += values.okwardDeliveryAmount || 0;
        }

        // Calculate commission if applicable
        if (values.hasCommission) {
            commissionAmount = (totalAmount * (values.commissionPercentage || 0)) / 100;
            totalAmount += commissionAmount;
            totalAmountWithTax += commissionAmount;
        }

        // Set calculated values in the form
        form.setValue('totalAmount', totalAmount.toFixed(2));
        form.setValue('sgst', totalSgst.toFixed(2));
        form.setValue('cgst', totalCgst.toFixed(2));
        form.setValue('igst', totalIgst.toFixed(2));
        form.setValue('totalAmountWithTax', totalAmountWithTax.toFixed(2));
        form.setValue('totalNetValue', totalNetValue.toFixed(2));
        form.setValue('totalSgst', totalSgst.toFixed(2));
        form.setValue('totalCgst', totalCgst.toFixed(2));
        form.setValue('totalIgst', totalIgst.toFixed(2));

        // Set commission amount if applicable
        if (values.hasCommission) {
            form.setValue('commissionAmount', commissionAmount.toFixed(2));
        }

        // Reset the flag after updates are done
        isUpdating.current = false;
    };


    //for agents & clients
    useEffect(() =>{
        const agentsData = async () => {
            try {
                const data = await fetchAgents();
                const agentsData = data.map((agent) => ({
                    value: agent.id,
                    label: agent.name
                }));
                setAgents(agentsData);
            } catch (error) {
                console.error("Error fetching agents:", error);
            }
        }
        agentsData().then(r => {});
    },[])

    // UseEffect to watch form changes and prevent recursion
    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (
                !isUpdating.current &&
                (name?.startsWith('items') ||
                    name === 'gst' ||
                    name === 'gstPercentage' ||
                    name === 'okwardDeliveryAmount' ||
                    name === 'commissionPercentage' ||
                    name === 'hasAgent')
            ) {
                isUpdating.current = true; // Prevent re-entry

                if (value.gst !== "CGST - SGST" && form.getValues("gstPercentage")) {
                    form.setValue("gstPercentage", null); // Clear the field
                }
                calculateTotals();
                setTimeout(() => {
                    isUpdating.current = false; // Allow updates again after ensuring calculateTotals completes
                }, 0);
            }
        });

        return () => subscription.unsubscribe();
    }, [form, calculateTotals]);


    return (
        <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">New Booking</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/*client id, docket no, booking date*/}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FormField
                            control={form.control}
                            name="clientId"
                            rules={{
                                required: "Client Id is required",
                            }}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Client Id</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: 001" {...field} className="w-full"/>
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.clientId?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="docketNo"
                            rules={{required: "Docket No is required"}}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Docket No</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: 001" {...field} className="w-full"/>
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.docketNo?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="bookingDate"
                            rules={{required: "Booking Date is required"}}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Booking Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" placeholder="dd/mm/yyyy" {...field} />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.bookingDate?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="pickupDate"
                            rules={{required: "Pickup Date is required"}}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Pickup Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" placeholder="dd/mm/yyyy" {...field} />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.pickupDate?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/*source and destination*/}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="source"
                            rules={{required: "Source is required"}}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Source</FormLabel>
                                    <FormControl>
                                        <Input {...field} className="w-full"/>
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.source?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="destination"
                            rules={{required: "Destination is required"}}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Destination</FormLabel>
                                    <FormControl>
                                        <Input {...field} className="w-full"/>
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.destination?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/*consignor and consignee*/}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="consignor"
                            rules={{required: "Consignor is required"}}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Consignor</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Sender's Name" {...field} className="w-full"/>
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.consignor?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="consignee"
                            rules={{required: "Consignee is required"}}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Consignee</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Receiver's Name" {...field} className="w-full"/>
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.consignee?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/*transportation section */}
                    <FormField
                        control={form.control}
                        name="transportationMode"
                        rules={{required: "Mode of Transportation is required"}}
                        render={({field}) => (
                            <FormItem className="space-y-3">
                                <FormLabel>Mode of Transportation</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value || ""}
                                        className="flex flex-row space-x-6 items-center"
                                    >
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="By Rail"/>
                                            </FormControl>
                                            <FormLabel className="font-normal">By Rail</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="By Air"/>
                                            </FormControl>
                                            <FormLabel className="font-normal">By Air</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="By Road"/>
                                            </FormControl>
                                            <FormLabel className="font-normal">By Road</FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage>{form.formState.errors.modeOfTransportation?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    {form.watch("transportationMode") === "By Rail" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="trainNumber"
                                rules={{required: "Please enter valid Lease Number"}}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Train Number</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="w-full"/>
                                        </FormControl>
                                        <FormMessage>{form.formState.errors.trainNumber?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="leaseNumber"
                                rules={{required: "Please enter valid Lease Number"}}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Lease Number</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="w-full"/>
                                        </FormControl>
                                        <FormMessage>{form.formState.errors.leaseNumber?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="hasRailwayReceipt"
                                render={({field}) => (
                                    <FormItem
                                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Railway Receipt
                                            </FormLabel>
                                            <FormDescription>
                                                If Applicable
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {form.watch().hasRailwayReceipt && (
                                <FormField
                                    control={form.control}
                                    name="railwayReceipt"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Railway Receipt</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Railway Receipt"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>
                    )}

                    {form.watch("transportationMode") === "By Road" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">

                            <FormField
                                control={form.control}
                                name="roadTransporterName"
                                rules={{required: "Transporter/Broker Name is required"}}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Transporter/Broker Name</FormLabel>
                                        <FormControl>
                                            <Input value={field.value || ""} placeholder="Transporter/Broker Name "  {...field} className="w-full"/>
                                        </FormControl>
                                        <FormMessage>{form.formState.errors.roadTransporterName?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="vehicleNumber"
                                rules={{required: "Please enter valid Vehicle Number"}}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Vehicle Number</FormLabel>
                                        <FormControl>
                                            <Input value={field.value || ""} {...field} className="w-full"/>
                                        </FormControl>
                                        <FormMessage>{form.formState.errors.vehicleNumber?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {form.watch("transportationMode") === "By Air" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">

                        <FormField
                            control={form.control}
                            name="airTransporterName"
                            rules={{required: "Transporter/Broker Name is required"}}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Transporter/Broker Name</FormLabel>
                                    <FormControl>
                                        <Input value={field.value || ""} placeholder="Transporter/Broker Name "  {...field} className="w-full"/>
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.airTransporterName?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="awbNo"
                            rules={{
                                required: "Please enter valid AWB Number",
                                pattern: {value: /^[0-9]{8}$/, message: "Invalid AWB Number"}
                            }}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>AWB Number</FormLabel>
                                    <FormControl>
                                        <Input {...field} className="w-full"/>
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.awbNo?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                        </div>
                    )}

                    {/*Consignee Details*/}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            rules={{required: "Consignee Name is required",}}
                            control={form.control}
                            name="consigneeName"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Consignee Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} className="w-full"/>
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.consigneeName?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <FormField
                            rules={{required: "Receiver's Address is required",}}
                            control={form.control}
                            name="consigneeAddress"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Consignee Address</FormLabel>
                                    <FormControl>
                                        <Input type="text" {...field} className="w-full"/>
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.consigneeAddress?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                        <FormField
                            rules={{
                                required: "Consignee GST No is required",
                                pattern: {
                                    value: /^[0-9]{2}[A-Z0-9]{10}[1-9A-Z]Z[A-Z0-9]{1}$/,
                                    message: "Invalid GST No"
                                },
                            }}
                            control={form.control}
                            name="gstNo"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Consignee GST No</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: 24ABCDE1234F1Z5" type="text" {...field}
                                               className="w-full"/>
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.gstNo?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                        <FormField
                            rules={{required: "City is required",}}
                            control={form.control}
                            name="city"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                        <Input type="text" {...field} className="w-full"/>
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.city?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                        <FormField
                            rules={{required: "State is required",}}
                            control={form.control}
                            name="state"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>State</FormLabel>
                                    <FormControl>
                                        <Input type="text" {...field} className="w-full"/>
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.state?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <FormField
                            rules={{
                                required: "State Code is required",
                                pattern: {value: /^[0-9]{2}$/, message: "Invalid State Code"}
                            }}
                            control={form.control}
                            name="stateCode"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>State Code</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ex: 24"
                                            type="number"
                                            {...field}
                                            value={field.value || ""} // Ensure the value is never undefined
                                            className="w-full"
                                        />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.stateCode?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        rules={{
                            required: "Please enter E-Way Bill No",
                            pattern: {value: /^\d{12}$/, message: "E-Way Bill number must be exactly 12 digits"},
                        }}
                        control={form.control}
                        name="eWayBillNo"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>E-Way Bill No</FormLabel>
                                <FormControl>
                                    <Input {...field} className="w-full"/>
                                </FormControl>
                                <FormMessage>{form.formState.errors.eWayBillNo?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    {/*error fixing remaining */}
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

                                    {/*Docket No Field*/}
                                    <FormField
                                        name={`items.${index}.docketNo`}
                                        control={form.control}
                                        rules={{required: "Docket No is required"}}
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Docket No</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="Ex: 001"
                                                        {...field}
                                                        min={0}
                                                        className="w-full"
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage>
                                                    {form.formState.errors?.items?.[index]?.docketNo?.message}
                                                </FormMessage>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Box Quantity Field */}
                                    <FormField
                                        name={`items.${index}.boxQuantity`}
                                        control={form.control}
                                        rules={{required: "Box Quantity is required"}}
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Box Quantity</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        min={0}
                                                        className="w-full"
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage>
                                                    {form.formState.errors?.items?.[index]?.boxQuantity?.message}
                                                </FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                    {/*Charge Weight Field*/}
                                    <FormField
                                        name={`items.${index}.chargedWeight`}
                                        control={form.control}
                                        rules={{required: "Charge Weight is required"}}
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Charge Weight</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01" // Allows decimal values
                                                        {...field}
                                                        min={0}
                                                        className="w-full"
                                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} // Ensure it's a valid number
                                                    />
                                                </FormControl>
                                                <FormMessage>
                                                    {form.formState.errors?.items?.[index]?.chargedWeight?.message}
                                                </FormMessage>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Rate per Kg Field */}
                                    <FormField
                                        name={`items.${index}.ratePerKg`}
                                        control={form.control}
                                        rules={{required: "Rate per Kg is required"}}
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Rate per Kg</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        min={0}
                                                        className="w-full"
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage>
                                                    {form.formState.errors?.items?.[index]?.ratePerKg?.message}
                                                </FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                    {/* Net Value Field */}
                                    <FormField
                                        name={`items.${index}.netValue`}
                                        control={form.control}
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Net Value</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        readOnly
                                                        className="w-full"
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Remove Button */}
                                {index > 0 && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => remove(index)}
                                        className="mt-2"
                                    >
                                        Remove Item
                                    </Button>
                                )}
                            </div>
                        ))}

                        {/* Add Item Button */}
                        <Button
                            type="button"
                            onClick={() =>
                                append({
                                    docketNo: '',
                                    boxQuantity: 0,
                                    chargedWeight: 0,
                                    ratePerKg: 0,
                                    netValue: 0,
                                    sgst: '',
                                    cgst: '',
                                    igst: ''
                                })
                            }
                            className="mt-2"
                        >
                            Add Item
                        </Button>
                    </div>


                    {/*booking charge & delivery charge*/}
                    <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                        <FormField
                            control={form.control}
                            name="bookingCharge"
                            rules={{required: "Booking Charge is required"}}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Booking Charge</FormLabel>
                                    <FormControl>
                                        <Input type="number" min={0} {...field}
                                               onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                               className="w-full"/>
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.bookingCharge?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="deliveryCharge"
                            rules={{required: "Delivery Charge is required"}}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Delivery Charge</FormLabel>
                                    <FormControl>
                                        <Input type="number" min={0} {...field}
                                               onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                               className="w-full"/>
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.deliveryCharge?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/*oda, commission, agent*/}
                    <div className="grid grid-cols-1 md:grid-cols-3  gap-6">
                        <FormField
                            control={form.control}
                            name="hasODA"
                            render={({field}) => (
                                <FormItem
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Okward Delivery Amount
                                        </FormLabel>
                                        <FormDescription>
                                            If Applicable
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="hasCommission"
                            render={({field}) => (
                                <FormItem
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Commission
                                        </FormLabel>
                                        <FormDescription>
                                            If Applicable
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="hasAgent"
                            render={({field}) => (
                                <FormItem
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Agent
                                        </FormLabel>
                                        <FormDescription>
                                            If Applicable
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>

                    {form.watch("hasODA") && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="okwardDeliveryAmount"
                                rules={{required: "Okward Delivery Amount is required"}}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Okward Delivery Amount</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Okward Delivery Amount"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage>{form.formState.errors.okwardDeliveryAmount?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {form.watch("hasCommission") && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="commissionPerson"
                                rules={{required: "Commission Person Name is required"}}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage>{form.formState.errors.commissionPerson?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="commissionPercentage"
                                rules={{required: "Commission Percentage is required"}}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Commission Percentage</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Enter percentage"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage>{form.formState.errors.commissionPercentage?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="commissionAmount"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Commission Amount</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} readOnly className="w-full"/>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {form.watch("hasAgent") && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="agentId"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Agent Name</FormLabel>
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
                                                            ? agents.find((agent) => agent.value === field.value)?.label
                                                            : "Select Agent"}
                                                        <ChevronsUpDown
                                                            className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                                <Command>
                                                    <CommandList>
                                                        <CommandInput placeholder="Search agent..."/>
                                                        <CommandEmpty>No agent found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {agents.map((agent) => (
                                                                <CommandItem
                                                                    value={agent.label}
                                                                    key={agent.value}
                                                                    onSelect={() => {
                                                                        form.setValue("agentId", agent.value);
                                                                        setOpen(false);
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            agent.value === field.value ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {agent.label}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </FormItem>
                                )}
                            />
                            {/*<FormField*/}
                            {/*    control={form.control}*/}
                            {/*    name="agentAmount"*/}
                            {/*    render={({field}) => (*/}
                            {/*        <FormItem>*/}
                            {/*            <FormLabel>Agent Amount</FormLabel>*/}
                            {/*            <FormControl>*/}
                            {/*                <Input*/}
                            {/*                    type="number"*/}
                            {/*                    placeholder="Agent Amount"*/}
                            {/*                    {...field}*/}
                            {/*                    onChange={(e) => field.onChange(parseFloat(e.target.value))}*/}
                            {/*                />*/}
                            {/*            </FormControl>*/}
                            {/*        </FormItem>*/}
                            {/*    )}*/}
                            {/*/>*/}
                        </div>
                    )}

                    {/*payment and payment status and gst*/}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                            control={form.control}
                            name="gst"
                            rules={{required: "Please select GST"}}
                            render={({field}) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>GST</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value || ""}
                                            className="flex flex-row space-x-6 items-center"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="CGST - SGST"/>
                                                </FormControl>
                                                <FormLabel className="font-normal">CGST & SGST</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="IGST"/>
                                                </FormControl>
                                                <FormLabel className="font-normal">IGST</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.gst?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="paymentDoneBy"
                            rules={{required: "Please select payment"}}
                            render={({field}) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Payment done by</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value || ""}
                                            className="flex flex-row space-x-6"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="consignee"/>
                                                </FormControl>
                                                <FormLabel className="font-normal">Consignee</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="consignor"/>
                                                </FormControl>
                                                <FormLabel className="font-normal">Consignor</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.paymentDoneBy?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="paymentStatus"
                            rules={{required: "Please select payment status"}}
                            render={({field}) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Payment Status</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value || ""}
                                            className="flex flex-row space-x-6"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="pending"/>
                                                </FormControl>
                                                <FormLabel className="font-normal">Pending</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="received"/>
                                                </FormControl>
                                                <FormLabel className="font-normal">Received</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.paymentStatus?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                    </div>
                    {form.watch("gst") === "CGST - SGST" && (
                        <FormField
                            control={form.control}
                            name="gstPercentage"
                            rules={{required: "Please select GST Percentage"}}
                            render={({field}) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>GST Percentage</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value || ''}
                                            className="flex flex-row space-x-6 items-center"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="5"/>
                                                </FormControl>
                                                <FormLabel className="font-normal">5% for Station to
                                                    Station</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="18"/>
                                                </FormControl>
                                                <FormLabel className="font-normal">18% for Door to Door</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.gstPercentage?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField
                            control={form.control}
                            name="totalAmount"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Total Amount</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} readOnly className="w-full"/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="totalAmountWithTax"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Total Amount with Tax</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} readOnly className="w-full"/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="totalNetValue"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Total Net Value</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} readOnly className="w-full"/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="totalSgst"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Total SGST</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} readOnly className="w-full"/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="totalCgst"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Total CGST</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} readOnly className="w-full"/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="totalIgst"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Total IGST</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} readOnly className="w-full"/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                        {isLoading ? "Submitting..." : "Submit"}
                    </Button>
                </form>
            </Form>

            {isLoading && (
                <Loader message='It will take some time to complete the booking. Please do not refresh the page.'/>
            )}
        </div>
        </ProtectedRoute>
    )
}

export default NewBooking

