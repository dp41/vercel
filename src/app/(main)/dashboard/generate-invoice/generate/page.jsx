'use client'
import React, {useState} from 'react';
import {CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {fetchClientDataByInvoiceNo, updateClientData} from "@/Handlers/handleDB";
import Loader from "@/components/Loader";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Image from "next/image";
import CreateInvoice from "@/components/CreateInvoice";
import {AuthProvider} from "@/context/AuthContext";

let roundoff;

const page = () => {
    const [invoiceNo  , setInvoiceNo] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [invoiceData, setInvoiceData] = useState({
        receiverName: '',
        receiverAddress: '',
        receiverGSTNo: '',
        city: '',
        state: '',
        invoiceDate: '',
        invoiceNo: '',
        bookingDate: '',
        pickupDate:'',
        transportationMode: '',
        consignor: '',
        consignee: '',
        source: '',
        destination: '',
        okwardDeliveryAmount: '',
        items: [{
            docketNo: '',
            boxQuantity: '',
            chargedWeight: '',
            ratePerKg: '',
            netValue: '',
            sgst:'',
            cgst: '',
            igst: ''
        }],
        totalAmount: '',
        totalAmountWithTax: '',
        totalNetValue: '',
        totalSgst: '',
        totalCgst: '',
        totalIgst: '',
    });
    const [isEditing, setIsEditing] = useState(false);

    const fetchDetails = async () => {

        setIsLoading(true);
        const data = await fetchClientDataByInvoiceNo(invoiceNo);
        if(data === null){
            setIsLoading(false);
            alert("Invoice does not exist");
        }else{
            roundoff = (data.cost.totalAmountWithTax - Math.floor(data.cost.totalAmountWithTax)).toFixed(2);
            setInvoiceData({
                ...data,
                receiverName: data.consigneeDetails.consigneeName,
                receiverAddress: data.consigneeDetails.receiverAddress,
                receiverGSTNo: data.consigneeDetails.receiverGSTNo,
                city: data.consigneeDetails.city,
                state: data.consigneeDetails.state,
                stateCode: data.consigneeDetails.stateCode,
                sacCode: data.sacCode,
                invoiceDate: new Date(),
                invoiceNo: data.invoiceNo,
                bookingDate: data.bookingDate,
                pickupDate: data.pickupDate,
                transportationMode: data.transportationMode.mode,
                consignor: data.consignor,
                consignee: data.consignee,
                source: data.source,
                destination: data.destination,
                okwardDeliveryAmount: data.okwardDeliveryAmount,
                items: data.items.map((item) => ({
                    docketNo: item.docketNo,
                    boxQuantity: item.boxQuantity,
                    chargedWeight: item.chargedWeight,
                    ratePerKg: item.ratePerKg,
                    netValue: item.netValue,
                    partyInvoiceNo: item.partyInvoiceNo || '',
                    sgst: item.sgst,
                    cgst: item.cgst,
                    igst: item.igst,
                })),
                taxPercentage: data.cost.taxPercentage,
                igstPercentage: data.cost.igstPercentage,
                roundoff: roundoff,
                totalAmount: data.cost.totalAmount,
                totalAmountWithTax: Math.floor(data.cost.totalAmountWithTax),
                totalNetValue: data.cost.totalNetValue,
                totalSgst: data.cost.totalSgst,
                totalCgst: data.cost.totalCgst,
                totalIgst: data.cost.totalIgst,
            });
            setIsLoading(false);
        }
    }

    const updateClientDataFirestore = async (updatedData) => {
        try {
            // Your existing Firestore update logic here (this should update the Firestore)
            await updateClientData(updatedData);
            console.log("Client data updated successfully");
        } catch (error) {
            console.error("Error updating client data:", error);
        }
    }

    const handleEditPartyInvoice  = async (index, newInvoiceNo) => {
        const updatedItems = [...invoiceData.items];
        console.log(updatedItems,index)
        updatedItems[index].partyInvoiceNo = newInvoiceNo;
        setInvoiceData({ ...invoiceData, items: updatedItems });
    };


    const handlePrint = () => {
        window.print();
    }


    function chunkArray(array, size) {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    }

    return (
        <AuthProvider>
        <div className="relative p-4 sm:p-6 lg:p-8">
            <CardTitle className="text-2xl sm:text-3xl font-bold mb-4">Generate Invoice</CardTitle>
            <>
                <div className="space-y-6">
                    {/* Invoice Header Section */}
                        <CreateInvoice/>

                    {/* Invoice Number Input Section */}
                    <div className="flex flex-wrap sm:flex-nowrap gap-4 items-end">
                        <div className="flex-grow">
                        <Label className="block text-sm font-medium">Invoice No</Label>
                            <Input
                                type="text"
                                placeholder="Ex: 101-25-26"
                                value={invoiceNo}
                                onChange={(e) => setInvoiceNo(e.target.value)}
                                className="mt-2 block w-full rounded-md shadow-sm"
                            />
                        </div>
                        <Button
                            type="submit"
                            onClick={() => {
                                if (!invoiceNo.trim()) {
                                    alert("Input field should not be empty.");
                                    return;
                                }
                                fetchDetails();
                            }}
                            disabled={isLoading}
                            className="w-full sm:w-auto px-6 py-2 text-white rounded-md"
                        >
                            {isLoading ? "Fetching..." : "Fetch Details"}
                        </Button>
                    </div>

                    {/* Action Buttons Section */}
                    <div className="flex flex-wrap justify-start gap-4 mt-4">
                        {/* Print Button */}
                        <Button
                            onClick={handlePrint}
                            disabled={isEditing}
                            className="px-6 py-2 text-white rounded-md shadow-md"
                        >
                            Print
                        </Button>

                        {/* Edit/Save Button */}
                        <Button
                            onClick={() => {
                                setIsEditing(!isEditing);
                                if(isEditing) {
                                    updateClientDataFirestore(invoiceData).then(r => {})
                                    console.log(invoiceData)
                                }
                            }}
                            className='px-6 py-2 rounded-md shadow-md text-white'
                        >
                            {isEditing ? "Save" : "Edit"}
                        </Button>
                    </div>
                </div>


                {
                    isLoading ? (
                        <div className="flex items-center justify-center mt-10">
                            <Loader message="Generating Invoice..."/>
                        </div>
                    ) : (
                        <div className="flex flex-wrap lg:flex-nowrap gap-6">
                            {/*Invoice Preview*/}
                            <div id="invoice-table"
                                 className="max-w-full lg:max-w-4xl mx-auto p-6 space-y-6 bg-white printable w-full lg:w-2/3">
                                {/* Invoice Title */}
                                <div className="text-center font-bold text-lg border-b pb-2 mt-36">
                                    TAX INVOICE
                                </div>

                                {/* Invoice Details Grid */}
                                <div className="grid grid-cols-2 gap-50 text-sm">
                                    <div className="space-y-2">
                                        <h3 className="font-bold">Detail Of Receiver</h3>
                                        <p className="w-2/3">{invoiceData.receiverName}</p>
                                        <p className="w-2/3">{invoiceData.receiverAddress}</p>
                                        <p className="w-2/3">{invoiceData.city}</p>
                                        <p className="w-2/3">{invoiceData.state}</p>
                                        <p className="font-semibold">GST No:{invoiceData.receiverGSTNo}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <p className="font-semibold">Invoice Number:</p>
                                        <p>{invoiceData.invoiceNo}</p>
                                        <p className="font-semibold">Invoice Date:</p>
                                        <p>{invoiceData.bookingDate}</p>
                                        <p className="font-semibold">Consignor:</p>
                                        <p>{invoiceData.consignor}</p>
                                        <p className="font-semibold">Consignee:</p>
                                        <p>{invoiceData.consignee}</p>
                                        <p className="font-semibold">Mode of Transportation:</p>
                                        <p>{invoiceData.transportationMode}</p>
                                        <p className="font-semibold">Origin:</p>
                                        <p>{invoiceData.source}</p>
                                        <p className="font-semibold">Destination:</p>
                                        <p>{invoiceData.destination}</p>
                                    </div>
                                </div>

                                {/* Main Table */}
                                <Table className="border shadcn-table">
                                    <TableHeader>
                                        <TableRow className="bg-gray-100">
                                            <TableHead className="border w-10">Sr. No.</TableHead>
                                            <TableHead className="border">Airex DC No. / Party Inv.
                                                No.</TableHead>
                                            <TableHead className="border">Pickup<br/>Date</TableHead>
                                            <TableHead className="border">No. of<br/>Packages</TableHead>
                                            <TableHead className="border">Charge<br/>Weight</TableHead>
                                            <TableHead className="border">Rate<br/>per kg</TableHead>
                                            <TableHead className="border">Net<br/>Value</TableHead>
                                            <TableHead className="border" colSpan={2}>CGST</TableHead>
                                            <TableHead className="border" colSpan={2}>SGST</TableHead>
                                            <TableHead className="border" colSpan={2}>IGST</TableHead>
                                        </TableRow>
                                        <TableRow className="bg-gray-50">
                                            <TableHead className="border"></TableHead>
                                            <TableHead className="border"></TableHead>
                                            <TableHead className="border"></TableHead>
                                            <TableHead className="border"></TableHead>
                                            <TableHead className="border"></TableHead>
                                            <TableHead className="border"></TableHead>
                                            <TableHead className="border"></TableHead>
                                            <TableHead className="border w-16">Rate</TableHead>
                                            <TableHead className="border w-16">Value</TableHead>
                                            <TableHead className="border w-16">Rate</TableHead>
                                            <TableHead className="border w-16">Value</TableHead>
                                            <TableHead className="border w-16">Rate</TableHead>
                                            <TableHead className="border w-16">Value</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    {chunkArray(invoiceData.items, 10).map((chunk, chunkIndex) => (
                                        <React.Fragment key={chunkIndex}>
                                            <TableBody className={chunkIndex > 0 ? "page-break mt-36 border" : ""}>
                                                {chunk.map((item, index) => (
                                                    <TableRow key={index} className="text-right">
                                                        <TableCell
                                                            className="border">{index + 1 + chunkIndex * 10}</TableCell>
                                                        <TableCell className="border">{item.docketNo}/
                                                            {isEditing ? (
                                                                <Input
                                                                    className="w-40"
                                                                    type="text"
                                                                    value={item.partyInvoiceNo || ''}
                                                                    onChange={(e) => handleEditPartyInvoice(index + chunkIndex * 10, e.target.value)}
                                                                />
                                                            ) : (
                                                                item.partyInvoiceNo
                                                            )}
                                                        </TableCell>
                                                        <TableCell
                                                            className="border">{invoiceData.pickupDate}</TableCell>
                                                        <TableCell className="border">{item.boxQuantity}</TableCell>
                                                        <TableCell className="border">{item.chargedWeight}</TableCell>
                                                        <TableCell className="border">{item.ratePerKg}</TableCell>
                                                        <TableCell className="border">{item.netValue}</TableCell>
                                                        <TableCell
                                                            className="border">{invoiceData.taxPercentage}</TableCell>
                                                        <TableCell className="border">{item.cgst}</TableCell>
                                                        <TableCell
                                                            className="border">{invoiceData.taxPercentage}</TableCell>
                                                        <TableCell className="border">{item.sgst}</TableCell>
                                                        <TableCell
                                                            className="border">{invoiceData.igstPercentage}</TableCell>
                                                        <TableCell className="border">{item.igst}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </React.Fragment>
                                    ))}
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell className="border font-semibold" colSpan={6}>Total</TableCell>
                                            <TableCell
                                                className="border text-right">{invoiceData.totalNetValue}</TableCell>
                                            <TableCell className="border text-right"
                                                       colSpan={2}>{invoiceData.totalCgst}</TableCell>
                                            <TableCell className="border text-right"
                                                       colSpan={2}>{invoiceData.totalSgst}</TableCell>
                                            <TableCell className="border text-right"
                                                       colSpan={2}>{invoiceData.totalIgst}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="border space-y-5" colSpan={7}>
                                                <p>GST NO. 24AGBPA5882F1ZQ / STATE
                                                    : {invoiceData.state.toUpperCase()} ({invoiceData.stateCode})</p>
                                                <p>AIREX RAIL CARGO SAC CODE : {invoiceData.sacCode}</p>
                                                <p>PAYEE: AIREX RAIL CARGO, A/C NO: 35360400000201</p>
                                                <p>IFSC CODE: BARAB0DARBAR, BRANCH: DARBAR CHOKDI</p>
                                                <p className="font-semibold">UDYAM REGISTRATION NO:
                                                    UDYAM-GJ-24-0053687</p>
                                            </TableCell>
                                            <TableCell className="border" colSpan={7}>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <p>Total Amount Before Tax</p>
                                                    <p className="text-right">{invoiceData.totalAmount}</p>
                                                    <p>Okward Delivery Amount</p>
                                                    <p className="text-right">{invoiceData.okwardDeliveryAmount || 0}</p>
                                                    <p>CGST @ {invoiceData.taxPercentage} %</p>
                                                    <p className="text-right">{invoiceData.totalCgst}</p>
                                                    <p>SGST @ {invoiceData.taxPercentage} %</p>
                                                    <p className="text-right">{invoiceData.totalSgst}</p>
                                                    <p>IGST @ {invoiceData.igstPercentage} %</p>
                                                    <p className="text-right">{invoiceData.totalIgst}</p>
                                                    <p>Round Off.</p>
                                                    <p className="text-right">-{invoiceData.roundoff}</p>
                                                    <p className="font-bold">Grand Total Rs.</p>
                                                    <p className="text-right font-bold"> {invoiceData.totalAmountWithTax}.00</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>

                                {/* Terms and Conditions with Stamp */}
                                <div className="border-t pt-4">
                                    <div className="flex gap-4">
                                        {/* Terms and Conditions */}
                                        <div className="flex-1 text-xs">
                                            <p className="font-semibold">Terms & Conditions:</p>
                                            <p>Certify that the above invoice is true and correct and the tax
                                                charged in the above invoice will be paid to the government
                                                exchequer as
                                                per the provision of the service tax.
                                                It is further certified the taxable services described above
                                                have been
                                                rendered by us and no other consideration is received towards
                                                the above
                                                service, directly or indirectly from the service receiver.</p>
                                        </div>
                                        {/* Authorized Stamp */}
                                        <div className="flex-shrink-0">
                                            <p className="text-sm text-right">For AIREX RAIL CARGO</p>
                                            <div
                                                className="relative w-32 h-32 flex justify-center items-center">
                                                <Image alt="stamp" src="/images/stamp.png" height={100}
                                                       width={100}/>
                                            </div>
                                        </div>

                                    </div>

                                    {/* Jurisdiction */}
                                    <div className="text-center text-sm font-semibold pt-0">
                                        SUBJECT TO VADODARA JURISDICTION
                                    </div>
                                </div>


                            </div>
                        </div>
                    )
                }

            </>
        </div>
        </AuthProvider>
    );
};

export default page;


