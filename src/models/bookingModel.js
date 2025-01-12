import {getLastAddedDocument} from "@/Handlers/handleDB";
let igstPercentage = 0;
let sacCode = 0


export const bookingModel = (data) => {
    if(data.gst === 'IGST'){
        igstPercentage = 18
    }
    if(data.gstPercentage === '5'){
        sacCode = 996512
    }else{
        sacCode = 996812
    }

    const filterNullValues = (obj) => {
        // Return a new object, excluding null, undefined, or empty string values (but keeping 0)
        return Object.fromEntries(
            Object.entries(obj).filter(([_, value]) => value || value === 0)
        );
    };

    const formatToTwoDecimal = (num) => {
        // Ensure the number is formatted to 2 decimal places if it exists
        return num != null ? parseFloat(num).toFixed(2) : num;
    };

    const charges = filterNullValues({
        bookingCharge: data.bookingCharge,
        deliveryCharge: data.deliveryCharge,
    });

    const consigneeDetails = filterNullValues({
        consigneeName : data.consigneeName,
        receiverAddress: data.consigneeAddress,
        receiverGSTNo: data.gstNo,
        city: data.city,
        state:data.state,
        stateCode: data.stateCode
    });

    const commission = filterNullValues({
        commissionPerson: data.commissionPerson,
        commissionAmount: data.commissionAmount,
        commissionPercentage: data.commissionPercentage,
    });

    const transportationMode = filterNullValues({
        mode: data.transportationMode,
        train: filterNullValues({
            trainNumber: data.trainNumber,
            leaseNumber: data.leaseNumber,
            railwayReceipt: data.railwayReceipt
        }),
        flight: filterNullValues({
            airTransporterName: data.airTransporterName,
            awbNo: data.awbNo,
        }),
        road: filterNullValues({
            roadTransporterName: data.roadTransporterName,
            vehicleNo: data.vehicleNumber,
        }),
    });

    const cost = filterNullValues({
        totalAmount: formatToTwoDecimal(data.totalAmount),
        totalAmountWithTax: formatToTwoDecimal(data.totalAmountWithTax),
        totalNetValue: formatToTwoDecimal(data.totalNetValue),
        totalSgst: formatToTwoDecimal(data.totalSgst),
        totalCgst: formatToTwoDecimal(data.totalCgst),
        totalIgst: formatToTwoDecimal(data.totalIgst),
        taxPercentage: ((data.gstPercentage) / 2),
        igstPercentage: igstPercentage
    });

    const items = (data.items || []).map((item) =>
        filterNullValues({
            docketNo: item.docketNo,
            boxQuantity: item.boxQuantity,
            chargedWeight: formatToTwoDecimal(item.chargedWeight),
            ratePerKg:formatToTwoDecimal( item.ratePerKg),
            netValue: formatToTwoDecimal(item.netValue),
            sgst: formatToTwoDecimal(item.sgst),
            cgst: formatToTwoDecimal(item.cgst),
            igst: formatToTwoDecimal(item.igst),
        })
    );

    return filterNullValues({
        invoiceNo: 'Not Generated',
        clientId: data.clientId,
        docketNo: data.docketNo,
        bookingDate: data.bookingDate,
        pickupDate: data.pickupDate,
        source: data.source,
        destination: data.destination,
        agentName: data.agentName,
        consignee: data.consignee,
        consignor: data.consignor,
        paymentDoneBy: data.paymentDoneBy,
        paymentStatus: data.paymentStatus,
        eWayBillNo: data.eWayBillNo,
        okwardDeliveryAmount: data.okwardDeliveryAmount,
        sacCode: sacCode,
        items,
        charges,
        commission,
        transportationMode,
        cost,
        consigneeDetails
    });
};
