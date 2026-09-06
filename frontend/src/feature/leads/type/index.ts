export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  country: string;
  countryId: string;
  ipAddress?: string;
  location?: string;
  travelDate?: string;
}

export const EMPTY: ContactFormData = {
  name: "",
  email: "",
  phone: "",
  country: "",
  countryId: "",
  travelDate: "",
};



export interface RegistrationPayload  {
  name:string;
  email:string;
  phone:string;
  country:string;
  countryId:string;
  ipAddress?:string;
  location?:string;
  pageReference?:string;
  travelDate?:string;
}

export interface TourBookingFormData {
  name: string;
  email: string;
  phone: string;
  country: string;
  countryId: string;
  ipAddress?: string;
  location?: string;
  pageReference?: string;
  travellerMessage: string;
  noOfPersons: string;
  noOfChildren: string;
  hotelCategory: string;
  travelStartDate: string;
  travelEndDate: string;
}

export const EMPTY_TOUR_BOOKING: TourBookingFormData = {
  name: "",
  email: "",
  phone: "",
  country: "",
  countryId: "",
  travellerMessage: "",
  noOfPersons: "",
  noOfChildren: "",
  hotelCategory: "",
  travelStartDate: "",
  travelEndDate: "",
};

export interface CarBookingFormData {
  name: string;
  email: string;
  phone: string;
  country: string;
  countryId: string;
  ipAddress?: string;
  location?: string;
  travellerMessage: string;
  vehicleName: string;
  serviceType: string;
}

export const EMPTY_CAR_BOOKING: CarBookingFormData = {
  name: "",
  email: "",
  phone: "",
  country: "",
  countryId: "",
  travellerMessage: "",
  vehicleName: "",
  serviceType: "",
};