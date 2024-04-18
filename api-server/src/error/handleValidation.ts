import mongoose from 'mongoose';
import { IGenericErrorMessage, IGenericErrorResponse } from '../interface/error';

const handleValidationError = (
    error: mongoose.Error.ValidationError
): IGenericErrorResponse => {
    console.log(`handleValidationError`, error)
    const errorMessages: IGenericErrorMessage[] = Object.values(error.errors).map(
        (el: mongoose.Error.ValidatorError | mongoose.Error.CastError) => {
            return {
                path: el.path,
                message: el.message,
            }
        }
    )

    const statusCode = 400

    return {
        statusCode,
        message: 'Validation Error',
        errorMessages,
    }
}

export default handleValidationError