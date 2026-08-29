import { leadSchema, tourBookingSchema, vehicleBookingSchema } from "../../utils/validation.js";
import { isValidUploadFolder } from "../../utils/uploadImage.js";

const validLead = {
  name: "Rajesh Kumar",
  email: "rajesh@example.com",
  phone: "+91 98765 12340",
  travelDate: "2026-12-25",
};

test("leadSchema: valid lead passes", () => {
  const result = leadSchema.safeParse(validLead);
  expect(result.success).toBe(true);
});

test("leadSchema: rejects invalid email", () => {
  const result = leadSchema.safeParse({ ...validLead, email: "not-an-email" });
  expect(result.success).toBe(false);
  expect(result.error.issues[0].message).toMatch(/valid email/i);
});

test("leadSchema: rejects too-short name", () => {
  const result = leadSchema.safeParse({ ...validLead, name: "A" });
  expect(result.success).toBe(false);
  expect(result.error.issues[0].message).toMatch(/Name is required/i);
});

test("leadSchema: rejects invalid travelDate", () => {
  const result = leadSchema.safeParse({ ...validLead, travelDate: "not-a-date" });
  expect(result.success).toBe(false);
  expect(result.error.issues.some((i) => /travel date/i.test(i.message))).toBe(true);
});

test("leadSchema: accepts empty/absent travelDate", () => {
  const result = leadSchema.safeParse({ name: "Test", email: "t@t.co", phone: "9876123400" });
  expect(result.success).toBe(true);
});

test("leadSchema: applies defaults (pageReference)", () => {
  const result = leadSchema.safeParse({ name: "Test", email: "t@t.co", phone: "9876123400" });
  expect(result.data.pageReference).toBe("/booking");
});

test("tourBookingSchema: valid booking passes", () => {
  const result = tourBookingSchema.safeParse({
    name: "Priya",
    email: "priya@example.com",
    phone: "9876123400",
    noOfPersons: 2,
    travelStartDate: "2026-12-01",
    travelEndDate: "2026-12-05",
  });
  expect(result.success).toBe(true);
});

test("tourBookingSchema: coerces numeric strings", () => {
  const result = tourBookingSchema.safeParse({ noOfPersons: "4" });
  expect(result.success).toBe(true);
  expect(result.data.noOfPersons).toBe(4);
});

test("tourBookingSchema: rejects negative persons", () => {
  const result = tourBookingSchema.safeParse({ noOfPersons: -1 });
  expect(result.success).toBe(false);
});

test("tourBookingSchema: rejects invalid date", () => {
  const result = tourBookingSchema.safeParse({ travelStartDate: "soon" });
  expect(result.success).toBe(false);
});

test("tourBookingSchema: empty paymentScreenshotUrl allowed, invalid URL rejected", () => {
  expect(tourBookingSchema.safeParse({ paymentScreenshotUrl: "" }).success).toBe(true);
  expect(tourBookingSchema.safeParse({ paymentScreenshotUrl: "not-a-url" }).success).toBe(false);
});

test("vehicleBookingSchema: valid booking passes", () => {
  const result = vehicleBookingSchema.safeParse({
    name: "Vikram",
    email: "vikram@example.com",
    phone: "9876123400",
    vehicleName: "Swift Dzire",
    serviceType: "outstation",
  });
  expect(result.success).toBe(true);
});

test("vehicleBookingSchema: rejects invalid email", () => {
  const result = vehicleBookingSchema.safeParse({ email: "bad" });
  expect(result.success).toBe(false);
});

test("isValidUploadFolder: allows safe folders", () => {
  expect(isValidUploadFolder("documents")).toBe(true);
  expect(isValidUploadFolder("india/trip")).toBe(true);
  expect(isValidUploadFolder("user")).toBe(true);
});

test("isValidUploadFolder: rejects traversal / unsafe folders", () => {
  expect(isValidUploadFolder("../..")).toBe(false);
  expect(isValidUploadFolder("../../etc")).toBe(false);
  expect(isValidUploadFolder("a/b/c")).toBe(false);
  expect(isValidUploadFolder("..")).toBe(false);
  expect(isValidUploadFolder("space in name")).toBe(false);
  expect(isValidUploadFolder("")).toBe(false);
  expect(isValidUploadFolder(undefined)).toBe(false);
});

test("isValidUploadFolder: normalizes separators safely (no traversal)", () => {
  expect(isValidUploadFolder("/etc/passwd")).toBe(true);
  expect(isValidUploadFolder("/documents")).toBe(true);
  expect(isValidUploadFolder("doc\\uments")).toBe(true);
});
