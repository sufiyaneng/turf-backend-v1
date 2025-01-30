import BadRequestError from "../middlewares/BadRequestError";
import {
  bookingSchema,
  checkAvailabilitySchema,
  getAllBookingsSchema,
} from "../validation/booking.schema";
import Booking from "../models/booking.model";
import { Request, Response, NextFunction, request } from "express";
import { convertUtcToIst, formatDateTime } from "../utils";
import moment from "moment-timezone";
import Turf from "../models/turf.model";
import { ITurf } from "../models/turf.model";

// creating a booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    const { error, value } = bookingSchema.validate(req.body);

    if (error) {
      throw new BadRequestError({ code: 400, message: error.message });
    }

    const newBooking = new Booking({ ...value, turfId: req.user.turfId });

    const savedBooking = await newBooking.save();

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
    const { error, value } = bookingSchema.validate(req.body);

    if (error) {
      throw new BadRequestError({ code: 400, message: error.message });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(bookingId, value);

    if (!updatedBooking) {
      throw new BadRequestError({ code: 404, message: "Booking not found" });
    }

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

    const deletedBooking = await Booking.findByIdAndDelete(bookingId);

    if (!deletedBooking) {
      throw new BadRequestError({ code: 404, message: "Booking not found" });
    }

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
    const { name } = turf as ITurf;
    res.status(200).json({
      data: {
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

export const getBookingStats = async (req: Request, res: Response) => {
   try {
        const todayDate = moment().tz("UTC").startOf("day").toDate(); 
        const tomorrowDate = moment().tz("UTC").add(1, "days").startOf("day").toDate();
        const yesterdayDate = moment().tz("UTC").subtract(1, "days").startOf("day").toDate();

        // Fetch booking counts
        const [todaysBookings, tomorrowsBookings, yesterdaysBookings] = await Promise.all([
            Booking.countDocuments({ slotDate: { $eq: todayDate } }),
            Booking.countDocuments({ slotDate: { $eq: tomorrowDate } }),
            Booking.countDocuments({ slotDate: { $eq: yesterdayDate } })
        ]);

        // Find the current live booking
        const now = moment().tz("UTC").format("hh:mmA"); 
        const liveBooking = await Booking.findOne({
            slotDate: todayDate,
            startTime: { $lte: now },
            endTime: { $gte: now }
        });

        // Prepare response
        const response: any[] = [
            { title: "Today's Booking", count: todaysBookings },
            { title: "Tomorrow Booking", count: tomorrowsBookings },
            { title: "Yesterday Booking", count: yesterdaysBookings }
        ];

        // Add live booking if exists
        if (liveBooking) {
            response.push({
                bookerName: liveBooking.bookerName,
                startTime: liveBooking.startTime,
                endTime: liveBooking.endTime,
                status: "Live"
            });
        }

        res.json(response);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
                                          