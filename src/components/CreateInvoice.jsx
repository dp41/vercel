'use client'
import React, {useState} from 'react'
import {fetchClientDataByDocketNo, getLastAddedDocument, saveInvoiceData} from "@/Handlers/handleDB";
import {CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {Copy} from "lucide-react";


let currentInvoiceNo = 100;
let invoiceNo;
let newInvoice;

function generateInvoiceNo(currentInvoiceNo) {
    // Get the current year
    const currentYear = new Date().getFullYear();

    // Get the next year (for the financial year format)
    const nextYear = currentYear + 1;

    // Format the invoice number as "113-24-25" (safe for Firestore)
    return `${currentInvoiceNo}-${currentYear.toString().slice(-2)}-${nextYear.toString().slice(-2)}`;
}

const getNewInvoiceNo = async () => {
    const lastDoc = await getLastAddedDocument();
    invoiceNo = generateInvoiceNo(currentInvoiceNo);
    if(!lastDoc){
        return invoiceNo
    }
    while(true){
        if(invoiceNo === lastDoc.invoiceNo){
            invoiceNo = generateInvoiceNo(currentInvoiceNo);
        }else if(invoiceNo !== lastDoc.invoiceNo){
            invoiceNo = generateInvoiceNo(++(lastDoc.invoiceNo.split('-')[0]));
            return invoiceNo
        }
        else{
            return invoiceNo
        }
        currentInvoiceNo++;
    }
}

getNewInvoiceNo().then((invoiceNo) => {
    newInvoice = invoiceNo;
});

const CreateInvoice = () => {
    const [docketNo  , setDocketNo] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [invoiceNo, setInvoiceNo] = useState('');



    const fetchDetails = async (trimmedDocketNo) => {
        setIsLoading(true);
        try {
            const data = await fetchClientDataByDocketNo(docketNo);
            if (!data) {
                alert("Booking with this docket does not exist.");
            } else {
                if (data.invoiceNo === "Not Generated") {
                    const newInvoice = await getNewInvoiceNo();
                    await saveInvoiceData(data, newInvoice);
                    setInvoiceNo(newInvoice);
                    alert("Invoice generated successfully. Go to 'Print Invoice' to print the invoice.");
                } else {
                    setInvoiceNo(data.invoiceNo);
                    alert("Invoice already generated.");
                }
            }
        } catch (error) {
            console.error("Error fetching details:", error);
            alert("An error occurred while generating the invoice. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedDocketNo = docketNo.trim();
        if (!trimmedDocketNo) {
            alert("Docket No cannot be empty.");
            return;
        }
        await fetchDetails(trimmedDocketNo); // Pass the current value to fetchDetails
    };

    return (
        <>
            <div className="flex flex-wrap sm:flex-nowrap gap-4 items-end">
                <div className="flex-grow">
                    <Label>Docket No</Label>
                    <Input
                        type="text"
                        placeholder="Ex:123456"
                        value={docketNo} // Corrected prop to "value"
                        onChange={(e) => setDocketNo(e.target.value)} // Update state on input change
                    />
                </div>
                <Button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full sm:w-auto text-white"
                >
                    {isLoading ? "Generating..." : "Generate Invoice"}
                </Button>
            </div>

            {invoiceNo && (
                <div className="mt-6">
                    <CopyToClipboard text={invoiceNo} onCopy={() => alert("Copied to clipboard")}>
                        <button className="flex items-center gap-2 font-semibold">
                            <Copy size={20}/> {/* Copy icon aligned to the side */}
                            <span>Invoice Number:</span>
                            <span className="text-primary">{invoiceNo}</span>
                        </button>
                    </CopyToClipboard>
                </div>
            )}

        </>)
}
export default CreateInvoice
