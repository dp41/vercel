// Initialize Firebase

import {collection, getDocs, doc, getDoc, setDoc, query, orderBy, arrayUnion, updateDoc, serverTimestamp,limit} from "firebase/firestore";
import {db, auth, onAuthStateChanged} from "@/lib/firebase";

const getUserUID = () => {
    return new Promise((resolve, reject) => {
        // Wait for Firebase Auth to initialize before calling currentUser
        const user = auth.currentUser;
        if (user) {
            resolve(user.uid);
            return;
        }

        // Otherwise, listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe(); // Clean up listener
            if (user) {
                resolve(user.uid);
            } else {
                reject(new Error("No user is logged in"));
            }
        });
    });
};

const userUID = await getUserUID();

// Check if Booking Exists by docketNo
export const checkBookingExistsByDocketNo = async (docketNo) => {
    const bookingRef = doc(db, `users/${userUID}/bookings`, docketNo);
    const bookingSnapshot = await getDoc(bookingRef);
    return bookingSnapshot.exists(); // Returns true if booking exists by docketNo
};


// Check if Client Exists (for the logged-in user)
export const checkClientExistsById = async (clientId) => {
    try {
        const clientRef = doc(db, `users/${userUID}/clients`, clientId);
        const clientSnapshot = await getDoc(clientRef);
        return clientSnapshot.exists(); // Returns true if client exists by id
    } catch (error) {
        console.error("Error checking client by id:", error);
        return false;
    }
};
// Check if Agent Exists (for the logged-in user)
export const checkAgentExistsById = async (agentId) => {
    try {
        const agentRef = doc(db, `users/${userUID}/agents`, agentId);
        const agentSnapshot = await getDoc(agentRef);
        return agentSnapshot.exists(); // Returns true if agent exists by id
    } catch (error) {
        console.error("Error checking agent by id:", error);
        return false;
    }
};


// Save Client Data
export const saveClientData = async (data) => {
    try {
        console.log("Submitting client data:", data);

        const clientRef = doc(db, `users/${userUID}/clients`, data.id);

        if (await checkClientExistsById(data.id)) {
            alert("Client already exists");
        } else {
            await setDoc(clientRef, {
                id: data.id,
                name: data.name,
                email: data.email,
                contactNo: data.contactNo,
                company: data.company,
                address: data.address,
                createdAt: serverTimestamp(),
                bookings: [],
                invoices: [],
            });
            console.log("Client saved successfully");
        }
    } catch (error) {
        console.error("Error saving client data:", error);
    }
};

// Save Agent Data
export const saveAgentData = async (data) => {
    try {
        console.log("Submitting agent data:", data);

        const agentRef = doc(db, `users/${userUID}/agents`, data.id);

        if (await checkAgentExistsById(data.id)) {
            alert("Agent already exists");
        } else {
            await setDoc(agentRef, {
                id: data.id,
                name: data.agentName,
                contactNo: data.agentContactNo,
                createdAt: serverTimestamp(),
                salaryAmount: [],
            });
            console.log("Agent saved successfully");
        }
    } catch (error) {
        console.error("Error saving agent data:", error);
    }
};

// Save Invoice Data
export const saveInvoiceData = async (data, invoiceNo) => {
    try {
        console.log("Submitting invoice data:", data);

        const clientRef = doc(db, `users/${userUID}/clients`, data.clientId);
        const bookingRef = doc(db, `users/${userUID}/bookings`, data.docketNo);
        const invoiceRef = doc(db, `users/${userUID}/invoices`, invoiceNo);

        if (await checkClientExistsById(data.clientId)) {
            // Update client's invoices
            await updateDoc(clientRef, {
                invoices: arrayUnion({
                    invoiceNo: invoiceNo,
                    docketNo: data.docketNo,
                    paymentStatus: data.paymentStatus || 'Pending',  // Provide default value if missing
                    paymentAmount: data.cost.totalAmountWithTax || 0 // Default to 0 if missing
                }),
            });

            // Update booking's invoiceNo
            await updateDoc(bookingRef, {
                invoiceNo: invoiceNo,
            });

            // Save the invoice
            await setDoc(invoiceRef, {
                createdAt: serverTimestamp(),
                invoiceNo: invoiceNo,
                docketNo: data.docketNo,
                clientId: data.clientId,
            });

            console.log("Invoice saved successfully");
        }
    } catch (error) {
        console.error("Error saving invoice data:", error);
    }
};

// Save Booking Data
export const saveBookingData = async (data) => {
    try {
        console.log("Submitting booking data:", data);

        const clientRef = doc(db, `users/${userUID}/clients`, data.clientId);
        const bookingRef = doc(db, `users/${userUID}/bookings`, data.docketNo);

        if (await checkClientExistsById(data.clientId)) {
            // Update client's bookings
            await updateDoc(clientRef, {
                bookings: arrayUnion({
                    docketNo: data.docketNo,
                    date: data.bookingDate,
                }),
            });

            // Save the booking
            await setDoc(bookingRef, {
                ...data,
                createdAt: serverTimestamp(),
            });

            console.log("Booking saved successfully");
        }
    } catch (error) {
        console.error("Error saving booking data:", error);
    }
};

// Save Profit Data
export const saveProfitData = async (data) => {
    try {
        console.log("Submitting profit data:", data);

        const profitRef = doc(db, `users/${userUID}/profits`, data.clientId);

        const profitSnapshot = await getDoc(profitRef);

        if (profitSnapshot.exists()) {
            const existingProfit = profitSnapshot.data().profit || 0;
            await updateDoc(profitRef, {
                profit: existingProfit + data.profit,
                updatedAt: serverTimestamp(),
            });
        } else {
            await setDoc(profitRef, {
                ...data,
                profit: data.profit,
                createdAt: serverTimestamp(),
            });
        }

        console.log("Profit saved successfully");
    } catch (error) {
        console.error("Error saving profit data:", error);
    }
};

// Update Agent Data
export const updateAgentData = async (id, data) => {
    try {
        console.log("Updating agent data:", data);

        const agentRef = doc(db, `users/${userUID}/agents`, id);

        await updateDoc(agentRef, {
            deliveries: arrayUnion({
                docketNo: data.docketNo,
                noOfBoxes: data.noOfBoxes,
                pickupDate: data.pickupDate,
                paymentDate: data.paymentDate,
                paymentAmount: data.paymentAmount,
                modeOfPayment: data.modeOfPayment
            }),
        });

        console.log("Agent updated successfully");
    } catch (error) {
        console.error("Error updating agent data:", error);
    }
};

export const updateClientData = async (updatedData) => {
    try {
        const bookingRef = doc(db, `users/${userUID}/bookings`, updatedData.docketNo);

        // Fetch the current booking data to ensure the document exists
        const bookingDoc = await getDoc(bookingRef);

        if (!bookingDoc.exists()) {
            throw new Error("Booking does not exist.");
        }

        // Directly replace the 'items' array with 'updatedData.items'
        await updateDoc(bookingRef, {
            items: updatedData.items,
        });

        console.log("Client data updated successfully with new items array.");
    } catch (error) {
        console.error("Error updating client data:", error);
    }
};




// Fetch the last added invoice document
export const getLastAddedDocument = async () => {
    try {
        const invoicesRef = collection(db, `users/${userUID}/invoices`);
        const q = query(invoicesRef, orderBy("createdAt", "desc"), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data(); // Return the data of the last added document
        } else {
            console.log("No documents found in the collection.");
            return null;
        }
    } catch (error) {
        console.error("Error fetching the last added document:", error);
        return null;
    }
};

// Fetch client data by docket number
export const fetchClientDataByDocketNo = async (docketNo) => {
    try {
        const bookingRef = doc(db, `users/${userUID}/bookings`, docketNo);
        const bookingSnap = await getDoc(bookingRef);

        if (bookingSnap.exists()) {
            return bookingSnap.data();  // Return the client data
        } else {
            console.log("Booking document not found!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching client data:", error);
        return null;
    }
};

// Fetch client data by invoice number
export const fetchClientDataByInvoiceNo = async (invoiceNo) => {
    try {
        const invoiceRef = doc(db, `users/${userUID}/invoices`, invoiceNo);
        const invoiceSnap = await getDoc(invoiceRef);

        if (invoiceSnap.exists()) {
            return fetchClientDataByDocketNo(invoiceSnap.data().docketNo);  // Return the client data
        } else {
            console.log("Invoice document not found!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching client data:", error);
        return null;
    }
}

// Fetch all clients for the logged-in user
export const fetchClients = async () => {
    try {
        const clientsRef = collection(db, `users/${userUID}/clients`);
        const clientsSnapshot = await getDocs(clientsRef);

        // Map the documents into an array with id and data, and return it
        return clientsSnapshot.docs.map((doc) => ({
            id: doc.id, // Document ID
            ...doc.data(), // Document data
        }));
    } catch (error) {
        console.error("Error fetching clients:", error);
        return []; // Return an empty array in case of error
    }
};

export const fetchClientDataByClientId = async (clientId) => {
    try {
        const clientRef = doc(db, `users/${userUID}/clients`, clientId);
        const clientSnapshot = await getDoc(clientRef);
        if (clientSnapshot.exists()) {
            return clientSnapshot.data();  // Return the client data
        } else {
            console.log("Client document not found!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching client data:", error);
    }
}

export const fetchAgentDataByAgentId = async (agentId) => {
    try {
        const agentRef = doc(db, `users/${userUID}/agents`, agentId);
        const agentSnapshot = await getDoc(agentRef);
        if (agentSnapshot.exists()) {
            return agentSnapshot.data();  // Return the agent data
        } else {
            console.log("Agent document not found!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching agent data:", error);
    }
}
// Fetch all agents for the logged-in user
export const fetchAgents = async () => {
    try {
        const agentsRef = collection(db, `users/${userUID}/agents`);
        const agentsSnapshot = await getDocs(agentsRef);

        // Map the documents into an array with id and data, and return it
        return agentsSnapshot.docs.map((doc) => ({
            id: doc.id, // Document ID
            ...doc.data(), // Document data
        }));
    } catch (error) {
        console.error("Error fetching agents:", error);
        return []; // Return an empty array in case of error
    }
};

