import httpStatus from "http-status";
import ApiError from "../../../error/apiError";
import { IUser } from "./user.interface";
import { User } from "./user.model";



const register = async (data: IUser) => {
    const result = await User.findOne({ email: data.email });

    if (result) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email already exists');
    }

    const user = await User.create(data);

    return user;
}


const login = async (data: IUser) => {
    const result = await User.findOne({ email: data.email });

    if (!result) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');
    }

    const isPasswordMatch = (data.password === result.password);

    if (!isPasswordMatch) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid password');
    }

    return result;
}




export const UserService = {
    register,
    login
}