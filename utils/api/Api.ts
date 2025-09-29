import axios from "axios";
import { getValueFor } from "../Service/SecureStore";

const ENDPOINT_URL = "https://api.blueaceindia.com/api/v1";
const LOCAL_ENDPOINT_URL = "https://api.blueaceindia.com/api/v1";
const TICKET = `https://api.blueaceindia.com/api/v1`;

export const login = async (
  email: string,
  password: string,
  number: string
) => {
  try {
    // const response = await axios.post(`${LOCAL_ENDPOINT_URL}/vendor-loging`, {
    //   Email: email,
    //   Number: number,
    //   Password: password,
    // });
    const response = await axios.post(
      `https://api.blueaceindia.com/api/v1/vendor-loging`,
      {
        Email: email,
        Number: number,
        Password: password,
      }
    );
    return response.data;
  } catch (error: any) {
    console.log(error?.response.data);
    return (
      error.response?.data || {
        message: "An error occurred during the request.",
      }
    );
  }
};

export const FetchNewOrder = async () => {
  const user = await getValueFor("user");
  // console.log("object",user)

  if (!user._id) {
    throw new Error("User not authenticated");
  }
  try {
    const { data } = await axios.get(
      `${LOCAL_ENDPOINT_URL}/get-order-by-id?vendorAlloted=${user?._id}`
    );

    // console.log("i am hit order", data.data.length);
    if (data.data.length > 0) {
      return data.data || 0;
    }
    return [];
  } catch (error: any) {
    console.error("Error fetching new orders:", error.response.data.message);
    return error.response.data.message;
  }
};

export const FetchErrorCodes = async () => {
  try {
    const res = await axios.get(`${LOCAL_ENDPOINT_URL}/get-all-error-code`)
    if(res.data.data.length > 0){
      return res.data.data
    }
    return [];
  } catch (error: any) {
    console.error("Error fetching new orders:", error.response.data.message);
    return error.response.data.message;
  }
}

export const FetchUserDetails = async () => {
  const user = await getValueFor("user");

  if (!user._id) {
    throw new Error("User not authenticated");
  }
  try {
    const res = await axios.get(`${LOCAL_ENDPOINT_URL}/findUser/${user._id}`);

    return res.data.data;
  } catch (error: any) {
    console.error("Error fetching User:", error.response);
    return error.response;
  }
};

export const handleChangeReadyToWork = async (readyToWork: any) => {
  const user = await getValueFor("user");

  if (!user._id) {
    throw new Error("User not authenticated");
  }

  try {
    const updatedStatus = readyToWork;
    const data = await axios.put(
      `${ENDPOINT_URL}/update-ready-to-work-status/${user._id}`,
      { readyToWork: updatedStatus }
    );
    return data.data;
  } catch (error: any) {
    console.error(
      "Error updating ready to work status:",
      error?.response?.data
    );
    return error?.response;
  }
};

export const fetchMemeber = async () => {
  const user = await getValueFor("user");
  console.log("Fetching user...");
  if (!user._id) {
    console.log("User not authenticated");
    throw new Error("User not authenticated");
  }

  try {
    const data = await axios.get(
      `${ENDPOINT_URL}/get-vendor-member/${user._id}`
    );
    // console.log("User data", data.data.data);
    return data.data.data;
  } catch (error: any) {
    console.error("Error Getting Member work status:", error?.response?.data);
    return error?.response;
  }
};

export const AllotMeber = async (orderId: any, member: any): Promise<void> => {
  try {
    const response = await axios.put(
      `${ENDPOINT_URL}/update-allot-vendor-member/${orderId}`,
      {
        AllowtedVendorMember: member,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error Allotting Member:", error?.response?.data);
    throw error?.response;
  }
};

export const getBill = async (orderId: string): Promise<void> => {
  try {
    const response = await axios.get(
      `${ENDPOINT_URL}/get-all-bills?orderId=${orderId}`
    );
    return response.data;
  } catch (error: any) {
    console.error("Error Allotting Member:", error?.response?.data);
    throw error?.response;
  }
};

export const DeleteBill = async (billId: string): Promise<void> => {
  try {
    const response = await axios.delete(
      `${ENDPOINT_URL}/delete-Estimated-bills/${billId}`
    );
    return response.data;
  } catch (error: any) {
    console.error("Error Allotting Member:", error?.response?.data);
    throw error?.response;
  }
};

export const GetDataOfVendor = async (stauts: string): Promise<void> => {
  const user = await getValueFor("user");

  if (!user._id) {
    throw new Error("User not authenticated");
  }
  try {
    const response = await axios.get(
      `${TICKET}/get-Data-Of-Vendor?vendorId=${user._id}&stauts=${stauts}`
    );
    // console.log("data", response.data)
    return response.data;
  } catch (error: any) {
    console.error("Error Allotting Member:", error?.response?.data);
    throw error?.response;
  }
};
