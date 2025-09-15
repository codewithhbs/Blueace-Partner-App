import axios from "axios";

const TICKET = `https://api.blueaceindia.com/api/v1`;

export const get_my_tickets = async (vendorId: string) => {
   
  try {
    const { data } = await axios.get(`${TICKET}/vendor-tickets/${vendorId}`);

   
    if (data.data && data.data.length > 0) {
      return {
        success: true,
        message: "Tickets fetched successfully!",
        data: data.data,
      };
    } else {
      throw new Error("You haven't raised any tickets yet.");
    }
  } catch (error: any) {
    console.error("Fetch tickets error Hu:", error.message || error);
    throw new Error(
      error.message || "Something went wrong while fetching tickets."
    );
  }
};

export const get_single_tickets = async (ticketId: string) => {
  try {
    const { data } = await axios.get(`${TICKET}/ticket/${ticketId}`);
console.log("ddd",data.data)
    if (data.data) {
      return {
        success: true,
        message: "Ticket details fetched successfully!",
        data: data.data,
      };
    } else {
      throw new Error("No ticket found with the selected ID.");
    }
  } catch (error: any) {
    console.error("Fetch ticket error:", error.message || error);
    throw new Error(
      error.message || "Something went wrong while fetching the ticket."
    );
  }
};

export const close_ticket = async (ticketId: string) => {
  try {
    const { data } = await axios.put(`${TICKET}/ticket-status/${ticketId}`);

    if (data.success) {
      return {
        success: true,
        message: "Ticket closed successfully!",
      };
    } else {
      throw new Error("Failed to close the ticket. It may not exist.");
    }
  } catch (error: any) {
    console.error("Close ticket error:", error.message || error);
    throw new Error(
      error.message || "Something went wrong while closing the ticket."
    );
  }
};
