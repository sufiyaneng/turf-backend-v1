import BadRequestError from "../middlewares/BadRequestError";
import {
  bookingSchema,
  getAllBookingsSchema,
} from "../validation/booking.schema";
import Booking from "../models/booking.model";
import { Request, Response, NextFunction, request } from "express";
import { convertUtcToIst, formatDateTime } from "../utils";

// creating a booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    // Validate request payload with Joi
    const { error, value } = bookingSchema.validate(req.body);

    if (error) {
      throw new BadRequestError({ code: 400, message: error.message });
    }

    // // Create a new booking instance using the validated data
    const newBooking = new Booking({ ...value, turfId: req.user.turfId });

    // // Save the booking to the database
    const savedBooking = await newBooking.save();

    // Respond with the created booking
    res.status(201).json({
      message: "Booking created successfully",
      data: savedBooking,
    });
  } catch (err: any) {
    throw new BadRequestError({ code: 500, message: err.message });
  }
};

// Update Booking
export const updateBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<boolean | any> => {
  try {
    const { bookingId } = req.params;
    // Validate request payload with Joi
    const { error, value } = bookingSchema.validate(req.body);

    if (error) {
      throw new BadRequestError({ code: 400, message: error.message });
    }

    // // Find the booking by ID and update with new values
    const updatedBooking = await Booking.findByIdAndUpdate(bookingId, value);

    if (!updatedBooking) {
      throw new BadRequestError({ code: 404, message: "Booking not found" });
    }

    // // Respond with the updated booking
    res.status(201).json({
      message: "Booking updated successfully",
      data: updatedBooking,
    });
  } catch (err: any) {
    throw new BadRequestError({ code: 500, message: err.message });
  }
};

// Delete Booking
export const deleteBooking = async (
  req: Request,
  res: Response
): Promise<boolean | any> => {
  try {
    const { bookingId } = req.params;

    // Find and delete the booking by ID
    const deletedBooking = await Booking.findByIdAndDelete(bookingId);

    if (!deletedBooking) {
      throw new BadRequestError({ code: 404, message: "Booking not found" });
    }

    // Respond with a success message
    res.status(200).json({
      message: "Booking deleted successfully",
    });
  } catch (err: any) {
    throw new BadRequestError({ code: 500, message: err.message });
  }
};

// Turf name API

export const getTurfName = async (
  req: Request,
  res: Response
): Promise<boolean | any> => {
  try {
    const { turfId } = req.params;
    // Find the booking by ID and populate the turf name
    const booking = await Booking.findOne({ turfId }).populate(
      "turfId",
      "name"
    );
    if (!booking) {
      throw new BadRequestError({ code: 404, message: "Turf not found" });
    }
    const { _id, name } = booking.turfId as any;
    res.status(200).json({
      message: "Turf name retrieved successfully",
      data: {
        turfId: _id,
        turfName: name,
      },
    });
    // // Respond with the turf name
    // res.status(200).json({
    //   message: "Turf name retrieved successfully",
    //   data: booking,
    // });
  } catch (err: any) {
    throw new BadRequestError({ code: 500, message: err.message });
  }
};

// // Get all bookings with pagination
// export const getAllBookings = async (request: Request, response: Response) => {
//   try {

//     // // Extract payload from the request body
//     const { type, filters, bookingId } = request.body;

//     // // Get the page and limit query parameters
//     // const page = parseInt(request.query.page as string) || 1;
//     // const limit = parseInt(request.query.limit as string) || 10;

//     // // Calculate the number of documents to skip
//     // const skip = (page - 1) * limit;

//     // // Build query conditions
//     // const query: any = {};
//     // // Determine the current date
//     // const currentDate = new Date();
//     // if (type) {
//     //   if (type === "upcoming") {
//     //     query.slotDate = { $gte: currentDate };
//     //   } else if (type === "previous") {
//     //     query.slotDate = { $lt: currentDate };
//     //   } else if (type === "cancelled") {
//     //     query.slotDate = { $lt: currentDate };
//     //     query.cancelled = true;
//     //   }
//     // }
//     //  else {
//     //    query.type = "upcoming";
//     //  }

//     // if (filters) {
//     //   if (filters.bookingDate) {
//     //     query.bookingDate = new Date(filters.bookingDate);
//     //   }
//     //   if (filters.slotDate) {
//     //     query.slotDate = new Date(filters.slotDate);
//     //   }
//     // }

//     // if (bookingId) {
//     //   query.bookingId = bookingId;
//     // }

//     // // Find filtered bookings with pagination
//     // const bookings = await Booking.find(query)
//     //   .skip(skip)
//     //   .limit(limit)
//     //   .sort({ createdAt: -1 });

//     // // Get the total count of bookings that match the query
//     // const total = await Booking.countDocuments(query);

//     // // Respond with the bookings and metadata
//     // response.status(200).json({
//     //   message: "Bookings retrieved successfully",
//     //   data: bookings,
//     //   meta: {
//     //     total,
//     //     page,
//     //     limit,
//     //     totalPages: Math.ceil(total / limit),
//     //   },
//     // });
//   } catch (error: any) {
//     response.status(500).json({ message: error.message });
//   }
// };

export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
  const { error, value } = getAllBookingsSchema.validate(req.body);
  try {
    const { type, bookerName, offset, limit, slotDate, bookingDate } = value;
    if (error) {
      throw new BadRequestError({ code: 400, message: error.message });
    }

    let query: any = {};

    // Filter by bookerName
    if (bookerName) {
      query.bookerName = bookerName;
    }

    // Filter by slotDate
    if (slotDate) {
      query.slotDate = new Date(slotDate);
    }

    // Filter by bookingDate (createdAt)
    if (bookingDate) {
      const startOfDay = new Date(bookingDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(bookingDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    // Additional filters for type (UPCOMING or PREVIOUS)
    if (!bookerName && !slotDate && !bookingDate) {
      const { currDate } = formatDateTime(convertUtcToIst(new Date().toISOString()));
      if (type === "UPCOMING") {
        query.slotDate = { $gte: currDate };
      } else if (type === "PREVIOUS") {
        query.slotDate = { $lt: currDate };
      }
    }

    // Get the total count of matching documents
    const totalCount = await Booking.countDocuments(query);

    // Fetch paginated bookings
    const bookings = await Booking.find(query)
      .skip(offset || 0)
      .limit(limit || 10);

    res.status(200).json({
      bookings,
      totalCount,
    });
  } catch (err: any) {
    throw new BadRequestError({ code: 500, message: err.message });
  }
};


