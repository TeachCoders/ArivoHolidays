import { prisma } from '../utils/prismaConnection.js';
import { sendTravellerEmail } from '../utils/emailSender.js';

async function main() {
  console.log("Fetching all travellers from database...");
  const travellers = await prisma.traveller.findMany({
    include: {
      tourBookings: true,
      vehicleBookings: true,
    }
  });

  console.log(`Found ${travellers.length} travellers.`);

  for (const traveller of travellers) {
    if (!traveller.email) continue;
    
    console.log(`Sending email to ${traveller.email}...`);
    
    // Determine the travel info to send
    let travelInfo = {};
    if (traveller.tourBookings.length > 0) {
      const tour = traveller.tourBookings[0];
      travelInfo = {
        bookingType: "Tour Booking (Previous)",
        hotelCategory: tour.hotelCategory,
        message: tour.travellerMessage,
      };
    } else if (traveller.vehicleBookings.length > 0) {
      const vehicle = traveller.vehicleBookings[0];
      travelInfo = {
        bookingType: "Vehicle Booking (Previous)",
        vehicleName: vehicle.vehicleName,
        serviceType: vehicle.serviceType,
      };
    } else {
      travelInfo = {
        interactionType: "Contact Inquiry / New Lead",
        message: "Thank you for reaching out previously.",
      };
    }

    try {
      await sendTravellerEmail(traveller.email, traveller.travellerId, traveller.name, travelInfo);
    } catch (err) {
      console.error(`Failed to send to ${traveller.email}:`, err.message);
    }
  }

  console.log("Finished sending past emails!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
