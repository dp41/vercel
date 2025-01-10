export const invoiceModel = (data) => {
    const receiverDetails = {
        receiverName : data.receiverName,
        receiverAddress: data.receiverAddress,
        receiverGSTNo: data.receiverGSTNo,
        city: data.city,
        state:data.state
    };

    const items = (data.items || []).map((item) =>
        ({
            docatNo: item.docatNo,
            boxQuantity: item.boxQuantity,
            chargedWeight: item.chargedWeight,
            ratePerKg:item.ratePerKg,
            netValue: item.netValue,
            sgst: item.sgst,
            cgst: item.cgst,
            igst: item.igst,
        })
    );

    const cost = {
        okwardDeliveryAmount: data.okwardDeliveryAmount,
        totalAmount: data.totalAmount,
        totalAmountWithTax: data.totalAmountWithTax,
        totalNetValue: data.totalNetValue,
        totalSgst: data.totalSgst,
        totalCgst: data.totalCgst,
        totalIgst: data.totalIgst,
    }
    return{
        invoiceNo: data.invoiceNo,
        invoiceDate: data.invoiceDate,
        source: data.source,
        destination: data.destination,
        transportationMode: data.transportationMode,
        consignor: data.consignor,
        consignee: data.consignee,
        cost,
        items,
        receiverDetails
    }

}