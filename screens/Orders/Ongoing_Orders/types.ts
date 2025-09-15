export interface Order {
    _id: string;
    serviceId: {
        name: string;
    };
    address: string;
    workingDay: string;
    workingTime: string;
    beforeWorkVideo?: {
        url: string;
    };
    OrderStatus: string;
    AllowtedVendorMember?: string;
    EstimatedBill?: {
        BillStatus: string;
    };
    vendorAlloted?: string;
}