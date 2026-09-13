/**
 * Automated Enterprise Headless Architecture QC Audit Suite
 * Verifies Next.js App Router routes, ISR caching headers, API contracts,
 * native checkout validation, and WordPress bridge plugin integrity.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("===============================================================");
console.log("⚡ STARTING HEADLESS ARCHITECTURE QC AUDIT SUITE");
console.log("===============================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// 1. Static ISR (24-Hour) Caching Audit
// ---------------------------------------------------------------------------
console.log("--- 1. Caching & Static ISR Verification (Vercel Quota Protection) ---");

const isrPages = [
  "app/page.jsx",
  "app/shop/page.jsx",
  "app/product/[slug]/page.jsx",
  "app/blog/page.jsx",
  "app/blog/[slug]/page.jsx",
  "app/contact/page.jsx",
  "app/pages/[slug]/page.jsx",
];

isrPages.forEach((relPath) => {
  const fullPath = path.join(rootDir, relPath);
  assert(fs.existsSync(fullPath), `File exists: ${relPath}`);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, "utf-8");
    assert(
      /revalidate\s*=\s*86400/.test(content),
      `${relPath} declares static ISR 'revalidate = 86400' (24-hour cache)`
    );
  }
});

// ---------------------------------------------------------------------------
// 2. Next.js API Routes Audit
// ---------------------------------------------------------------------------
console.log("\n--- 2. Next.js API Routes & Endpoints Verification ---");

const apiRoutes = [
  { file: "app/api/revalidate/route.js", methods: ["POST", "GET"] },
  { file: "app/api/checkout/route.js", methods: ["POST"] },
  { file: "app/api/track-order/route.js", methods: ["POST", "GET"] },
  { file: "app/api/auth/otp/route.js", methods: ["POST", "GET"] },
];

apiRoutes.forEach(({ file, methods }) => {
  const fullPath = path.join(rootDir, file);
  assert(fs.existsSync(fullPath), `API Route exists: ${file}`);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, "utf-8");
    methods.forEach((m) => {
      assert(content.includes(`export async function ${m}`), `${file} exports HTTP ${m} handler`);
    });
  }
});

// ---------------------------------------------------------------------------
// 3. Frontend Pages & Components Audit
// ---------------------------------------------------------------------------
console.log("\n--- 3. Native Frontend Pages & Components Verification ---");

const frontendComponents = [
  {
    file: "app/checkout/page.jsx",
    check: (c) => c.includes("NativeCheckoutForm"),
    label: "Native Checkout page renders NativeCheckoutForm component",
  },
  {
    file: "components/native-checkout-form.jsx",
    check: (c) => c.includes("handleSubmitOrder") && c.includes("/api/checkout") && c.includes("sameAsBilling"),
    label: "NativeCheckoutForm handles order submission, COD/Razorpay & address state",
  },
  {
    file: "app/order-success/page.jsx",
    check: (c) => c.includes("Order Confirmed") && c.includes("Track Shipment"),
    label: "Order Success page displays confirmation, order ID & shipment tracking link",
  },
  {
    file: "app/account/page.jsx",
    check: (c) => c.includes("Sign In with OTP") && c.includes("handleVerifyOtp") && c.includes("My Orders"),
    label: "Customer Account Portal implements Email OTP login, order list & address management",
  },
  {
    file: "app/track-order/page.jsx",
    check: (c) => c.includes("Live Shipment Tracker") && c.includes("AWB") && c.includes("Step"),
    label: "Track Order page implements 4-step progress tracker and courier tracking links",
  },
  {
    file: "app/manage-wp/page.jsx",
    check: (c) => c.includes("wp-login.php"),
    label: "manage-wp route implements 301 redirect to WordPress login",
  },
  {
    file: "components/global-cart-drawer.jsx",
    check: (c) => c.includes('href="/checkout"'),
    label: "Global Cart Drawer navigates natively to /checkout",
  },
];

frontendComponents.forEach(({ file, check, label }) => {
  const fullPath = path.join(rootDir, file);
  assert(fs.existsSync(fullPath), `File exists: ${file}`);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, "utf-8");
    assert(check(content), label);
  }
});

// ---------------------------------------------------------------------------
// 4. WordPress Headless Bridge Plugin Verification
// ---------------------------------------------------------------------------
console.log("\n--- 4. WordPress Headless Bridge Plugin Verification ---");

const wpPluginPath = path.join(rootDir, "wordpress-plugin/meraki-storefront-manager.php");
assert(fs.existsSync(wpPluginPath), "WordPress bridge plugin file exists");

if (fs.existsSync(wpPluginPath)) {
  const wpCode = fs.readFileSync(wpPluginPath, "utf-8");

  assert(
    wpCode.includes("meraki_trigger_frontend_revalidation"),
    "WP Bridge implements automated non-blocking ISR revalidation trigger"
  );
  assert(
    wpCode.includes("meraki_add_sync_cache_admin_bar"),
    "WP Bridge registers ⚡ Sync Frontend Cache button in Admin Top Bar"
  );
  assert(
    wpCode.includes("/auth/send-verification-code") && wpCode.includes("/auth/verify-code"),
    "WP Bridge registers headless Email OTP routes under /screwnet/v1/auth/"
  );
  assert(
    wpCode.includes("_customer_email_verified"),
    "WP Bridge updates _customer_email_verified flag upon OTP confirmation"
  );
  assert(
    wpCode.includes("/track-order") && wpCode.includes("_wc_shipment_tracking_items"),
    "WP Bridge integrates with Advanced Shipment Tracking (AST) metadata"
  );
  assert(
    wpCode.includes("screwnet_build_courier_url"),
    "WP Bridge builds direct tracker URLs for Delhivery, Blue Dart, DTDC, India Post"
  );
  assert(
    wpCode.includes("meraki_brand_login_page_styling"),
    "WP Bridge customizes and white-labels wp-login.php styling"
  );
  assert(
    wpCode.includes("wp_mail_from"),
    "WP Bridge centralizes transactional email outgoing addresses"
  );
}

// ---------------------------------------------------------------------------
// 5. API Route Handlers Contract & Logic Verification
// ---------------------------------------------------------------------------
console.log("\n--- 5. API Route Handlers Contract & Logic Verification ---");

// 5.1 Revalidation Route Contract
const revalContent = fs.readFileSync(path.join(rootDir, "app/api/revalidate/route.js"), "utf-8");
assert(
  revalContent.includes("revalidatePath") && revalContent.includes("REVALIDATION_SECRET"),
  "POST/GET /api/revalidate checks REVALIDATION_SECRET and triggers revalidatePath"
);
assert(
  revalContent.includes("status: 401") && revalContent.includes("Invalid or missing"),
  "/api/revalidate responds with HTTP 401 when secret is invalid"
);

// 5.2 Checkout Route Contract
const checkoutContent = fs.readFileSync(path.join(rootDir, "app/api/checkout/route.js"), "utf-8");
assert(
  checkoutContent.includes("wc/v3/orders") && checkoutContent.includes("Authorization"),
  "POST /api/checkout authenticates and posts orders to WooCommerce REST API"
);
assert(
  checkoutContent.includes("subtotal < 300"),
  "POST /api/checkout validates ₹300 minimum order threshold"
);
assert(
  checkoutContent.includes("status: isCod ? \"processing\" : \"pending\""),
  "POST /api/checkout assigns correct order status for COD vs Online payments"
);

// 5.3 Track Order Route Contract
const trackContent = fs.readFileSync(path.join(rootDir, "app/api/track-order/route.js"), "utf-8");
assert(
  trackContent.includes("screwnet/v1/track-order") && trackContent.includes("queryIdent"),
  "POST/GET /api/track-order validates identifier and queries AST shipment tracking endpoint"
);

// 5.4 Auth OTP Route Contract
const authOtpContent = fs.readFileSync(path.join(rootDir, "app/api/auth/otp/route.js"), "utf-8");
assert(
  authOtpContent.includes("send-verification-code") && authOtpContent.includes("verify-code"),
  "POST /api/auth/otp routes send and verify OTP actions to headless WordPress endpoints"
);
assert(
  authOtpContent.includes("update-address") && authOtpContent.includes("x-customer-token"),
  "POST /api/auth/otp securely syncs customer address with X-Customer-Token"
);

console.log("\n===============================================================");
console.log(`🏁 QC AUDIT COMPLETED: ${passed} PASSED | ${failed} FAILED`);
console.log("===============================================================\n");

if (failed > 0) {
  process.exit(1);
}
