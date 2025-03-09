import { ApiErrors } from "../utils/apiError.js";

const errorHandler = (err, req, res, next) => {

    if (err instanceof ApiErrors) {
        res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.errors,
            data: err.data,
        });
    } else {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};

export default errorHandler;