import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.warn("WARNING: SUPABASE_URL or SUPABASE_ANON_KEY is missing. Database operations will fail.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper for Supabase errors
const handleSupabaseError = (res: any, error: any, context: string) => {
  console.error(`Supabase error in ${context}:`, JSON.stringify(error, null, 2));
  const message = error.message || "Unknown database error";
  const details = error.details || "";
  const hint = error.hint || "";
  
  return res.status(500).json({ 
    error: `${context}: ${message}`,
    details: details,
    hint: hint || "Ensure you've ran the latest SUPABASE_FIX.sql in your Supabase dashboard."
  });
};

// API ROUTES
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Gigs
app.get("/api/gigs", async (req, res) => {
  if (!supabaseUrl || !supabaseKey) {
    return res.status(503).json({ error: "Supabase configuration is missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your secrets." });
  }
  try {
    const { data, error } = await supabase.from("gigs").select("*").order("created_at", { ascending: false });
    if (error) return handleSupabaseError(res, error, "getGigs");
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to fetch gigs: ${err.message}` });
  }
});

app.post("/api/gigs", async (req, res) => {
  try {
    const { data, error } = await supabase.from("gigs").insert([req.body]).select();
    if (error) return handleSupabaseError(res, error, "postGig");
    res.json(data ? data[0] : null);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to post gig: ${err.message}` });
  }
});

app.put("/api/gigs/:id", async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const { data, error } = await supabase.from("gigs").update(updateData).eq("id", req.params.id).select();
    if (error) return handleSupabaseError(res, error, "updateGig");
    res.json(data ? data[0] : null);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to update gig: ${err.message}` });
  }
});

app.delete("/api/gigs/:id", async (req, res) => {
  try {
    const { error } = await supabase.from("gigs").delete().eq("id", req.params.id);
    if (error) return handleSupabaseError(res, error, "deleteGig");
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to delete gig: ${err.message}` });
  }
});

// Seekers
app.get("/api/seekers", async (req, res) => {
  try {
    const { data, error } = await supabase.from("seekers").select("*").order("created_at", { ascending: false });
    if (error) return handleSupabaseError(res, error, "getSeekers");
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to fetch seekers: ${err.message}` });
  }
});

app.post("/api/seekers", async (req, res) => {
  try {
    const { data, error } = await supabase.from("seekers").insert([req.body]).select();
    if (error) return handleSupabaseError(res, error, "postSeeker");
    res.json(data ? data[0] : null);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to post seeker: ${err.message}` });
  }
});

app.put("/api/seekers/:id", async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const { data, error } = await supabase.from("seekers").update(updateData).eq("id", req.params.id).select();
    if (error) return handleSupabaseError(res, error, "updateSeeker");
    res.json(data ? data[0] : null);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to update seeker: ${err.message}` });
  }
});

app.delete("/api/seekers/:id", async (req, res) => {
  try {
    const { error } = await supabase.from("seekers").delete().eq("id", req.params.id);
    if (error) return handleSupabaseError(res, error, "deleteSeeker");
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to delete seeker: ${err.message}` });
  }
});

// Market Items (Selling/Wanted)
app.get("/api/market-items", async (req, res) => {
  try {
    const { data, error } = await supabase.from("market_items").select("*").order("created_at", { ascending: false });
    if (error) return handleSupabaseError(res, error, "getMarketItems");
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to fetch market items: ${err.message}` });
  }
});

app.post("/api/market-items", async (req, res) => {
  try {
    const { data, error } = await supabase.from("market_items").insert([req.body]).select();
    if (error) return handleSupabaseError(res, error, "postMarketItem");
    res.json(data ? data[0] : null);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to post market item: ${err.message}` });
  }
});

app.put("/api/market-items/:id", async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const { data, error } = await supabase.from("market_items").update(updateData).eq("id", req.params.id).select();
    if (error) return handleSupabaseError(res, error, "updateMarketItem");
    res.json(data ? data[0] : null);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to update market item: ${err.message}` });
  }
});

app.delete("/api/market-items/:id", async (req, res) => {
  try {
    const { error } = await supabase.from("market_items").delete().eq("id", req.params.id);
    if (error) return handleSupabaseError(res, error, "deleteMarketItem");
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to delete market item: ${err.message}` });
  }
});

// Profiles
app.get("/api/profiles", async (req, res) => {
  try {
    const { data, error } = await supabase.from("profiles").select("*");
    if (error) return handleSupabaseError(res, error, "getProfiles");
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to fetch profiles: ${err.message}` });
  }
});

app.put("/api/profiles/:id", async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const { data, error } = await supabase.from("profiles").update(updateData).eq("id", req.params.id).select();
    if (error) return handleSupabaseError(res, error, "updateProfile");
    res.json(data ? data[0] : null);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to update profile: ${err.message}` });
  }
});


// Notifications
app.get("/api/notifications", async (req, res) => {
  try {
    const { data, error } = await supabase.from("notifications").select("*").order("timestamp", { ascending: false });
    if (error) return handleSupabaseError(res, error, "getNotifications");
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to fetch notifications: ${err.message}` });
  }
});

app.post("/api/notifications", async (req, res) => {
  try {
    const { data, error } = await supabase.from("notifications").insert([req.body]).select();
    if (error) return handleSupabaseError(res, error, "postNotification");
    res.json(data ? data[0] : null);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to post notification: ${err.message}` });
  }
});

app.put("/api/notifications/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from("notifications").update(req.body).eq("id", req.params.id).select();
    if (error) return handleSupabaseError(res, error, "updateNotification");
    res.json(data ? data[0] : null);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to update notification: ${err.message}` });
  }
});

app.delete("/api/notifications/:id", async (req, res) => {
  try {
    const { error } = await supabase.from("notifications").delete().eq("id", req.params.id);
    if (error) return handleSupabaseError(res, error, "deleteNotification");
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to delete notification: ${err.message}` });
  }
});

// Promotions
app.get("/api/promotions", async (req, res) => {
  try {
    const { data, error } = await supabase.from("promotions").select("*").order("created_at", { ascending: false });
    if (error) return handleSupabaseError(res, error, "getPromotions");
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to fetch promotions: ${err.message}` });
  }
});

app.post("/api/promotions", async (req, res) => {
  try {
    const { data, error } = await supabase.from("promotions").insert([req.body]).select();
    if (error) return handleSupabaseError(res, error, "postPromotion");
    res.json(data ? data[0] : null);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to post promotion: ${err.message}` });
  }
});

// Messages
app.get("/api/messages", async (req, res) => {
  try {
    const { data, error } = await supabase.from("messages").select("*").order("timestamp", { ascending: true });
    if (error) return handleSupabaseError(res, error, "getMessages");
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to fetch messages: ${err.message}` });
  }
});

app.post("/api/messages", async (req, res) => {
  try {
    const { data, error } = await supabase.from("messages").insert([req.body]).select();
    if (error) return handleSupabaseError(res, error, "postMessage");
    res.json(data ? data[0] : null);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to post message: ${err.message}` });
  }
});

app.put("/api/messages/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from("messages").update(req.body).eq("id", req.params.id).select();
    if (error) return handleSupabaseError(res, error, "updateMessage");
    res.json(data ? data[0] : null);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to update message: ${err.message}` });
  }
});

// Topup Requests
app.get("/api/topup-requests", async (req, res) => {
  try {
    const { data, error } = await supabase.from("topup_requests").select("*").order("date", { ascending: false });
    if (error) return handleSupabaseError(res, error, "getTopupRequests");
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to fetch topup requests: ${err.message}` });
  }
});

app.post("/api/topup-requests", async (req, res) => {
  try {
    const { data, error } = await supabase.from("topup_requests").insert([req.body]).select();
    if (error) return handleSupabaseError(res, error, "postTopupRequest");
    res.json(data ? data[0] : null);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to post topup request: ${err.message}` });
  }
});

app.put("/api/topup-requests/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from("topup_requests").update(req.body).eq("id", req.params.id).select();
    if (error) return handleSupabaseError(res, error, "updateTopupRequest");
    res.json(data ? data[0] : null);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to update topup request: ${err.message}` });
  }
});

// Vite Middleware for Dev, Static Server for Prod
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupServer();
