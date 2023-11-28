import { IpaginationOptions } from "../interface/pagination";


type IpaginationOptionResult = {
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
}

const calculatePagination = (options: IpaginationOptions): IpaginationOptionResult => {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy = options.sortBy || "createdAt";
    const sortOrder = options.sortOrder || "desc";

    return {
        page,
        limit,
        skip,
        sortBy,
        sortOrder
    }
}


export const PaginationHelper = {
    calculatePagination
}