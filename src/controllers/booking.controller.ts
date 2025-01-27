import BadRequestError from "../middlewares/BadRequestError";
import {
  bookingSchema,
  checkAvailabilitySchema,
  getAllBookingsSchema,
} from "../validation/booking.schema";
import Booking from "../models/booking.model";
import { Request, Response, NextFunction, request } from "express";
import { convertUtcToIst, formatDateTime } from "../utils";
import moment from "moment";

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

export const getAllBookings = async (req: Request, res: Response) => {
  const { type, slotDate } = req.body;

  const isoDate = moment.utc(slotDate, "DD-MM-YYYY").toISOString();

  const query = {
    slotDate: isoDate,
  };

  try {
    const response = await Booking.find(query);

    const bookings = response && response.filter((booking:any)=>{
      const cTime = moment().format('hh:mmA');

      const startTime = moment(booking.startTime, 'hh:mmA');
      const currentTime = moment(cTime, 'hh:mmA');
      
      if(type=== 'UPCOMING') return startTime.isAfter(currentTime);
      else if(type === 'PREVIOUS') return startTime.isBefore(currentTime);
    }) 

    res.status(200).json(bookings);
  } catch (err: any) {
    throw new BadRequestError({ code: 500, message: err.message });
  }
};

export const checkAvailability = async (req: Request, res: Response) => {
  try{
    const {value, error}= checkAvailabilitySchema.validate(req.body);
    if(error) throw new BadRequestError({code:400, message:error.details[0].message});

    res.status(200).json({message:"Slot is available"});

  }catch(err:any){
   throw new BadRequestError({code:500, message:err.message});
  }
};
                                          