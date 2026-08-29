import { generateInvoiceEmailHTML } from "../templates/travellerEmailTemplate.js";
try {
  const html = generateInvoiceEmailHTML(
    "Test User",
    "INV-123",
    {
      packageName: "Test Package",
      items: [ { location: "Delhi", ServiceName: "Hotel", ServcieQty: 2, TotalPrice: 1000 } ],
      includes: ["WiFi"],
      excludes: ["Lunch"],
      notes: "Some notes",
      bannerImageUrl: ["http://example.com/img.jpg"],
      travellerInfo: { name: "Test User", email: "test@example.com" }
    },
    1000, 120, 0, 1120,
    null, null
  );
  console.log("SUCCESS length:", html.length);
} catch (e) {
  console.error("ERROR:", e);
}
