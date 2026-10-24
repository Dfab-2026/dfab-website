import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/security/auth";
import { assertSameOrigin, requestId } from "@/lib/security/request";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { assertDrawingQuota } from "@/lib/subscription/limits";

const paramsSchema = z.object({ id: z.string().uuid() });
const maxBytes = 25 * 1024 * 1024;

const formats: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
  ".webp": "image/webp",
  ".dxf": "application/dxf",
  ".dwg": "application/acad",
  ".step": "application/step",
  ".stp": "application/step",
  ".iges": "model/iges",
  ".igs": "model/iges",
  ".zip": "application/zip"
};

function extension(name: string) {
  const index = name.lastIndexOf(".");
  return index >= 0 ? name.slice(index).toLowerCase() : "";
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const traceId = requestId(request);
  try {
    assertSameOrigin(request);
    const params = paramsSchema.parse(await context.params);
    const { supabase, membership, user } = await requireRole(["owner", "admin", "estimator"]);

    await enforceRateLimit(supabase, "POST:/api/rfqs/:id/drawings", 20, 60);
    await assertDrawingQuota(supabase, membership.tenant_id);

    const { data: rfq } = await supabase.from("rfqs").select("id").eq("tenant_id", membership.tenant_id).eq("id", params.id).maybeSingle();
    if (!rfq) return NextResponse.json({ error: "RFQ not found", traceId }, { status: 404 });

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Drawing file is required", traceId }, { status: 400 });

    const ext = extension(file.name);
    const normalizedType = formats[ext];
    if (!normalizedType) return NextResponse.json({ error: "Unsupported drawing format", traceId }, { status: 415 });
    if (file.size <= 0 || file.size > maxBytes) return NextResponse.json({ error: "Each drawing must be between 1 byte and 25 MB", traceId }, { status: 413 });

    const drawingId = crypto.randomUUID();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
    const path = `${membership.tenant_id}/${params.id}/${drawingId}/${safeName}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const contentType = file.type && file.type !== "application/octet-stream" ? file.type : normalizedType;

    const upload = await supabase.storage.from("drawings").upload(path, bytes, { contentType, upsert: false });
    if (upload.error) throw upload.error;

    const { error: insertError } = await supabase.from("drawings").insert({
      id: drawingId,
      tenant_id: membership.tenant_id,
      rfq_id: params.id,
      file_name: safeName,
      storage_path: path,
      mime_type: contentType,
      size_bytes: file.size,
      extraction_status: "queued",
      uploaded_by: user.id
    });
    if (insertError) {
      await supabase.storage.from("drawings").remove([path]);
      throw insertError;
    }

    const { error: jobError } = await supabase.from("analysis_jobs").insert({
      tenant_id: membership.tenant_id,
      rfq_id: params.id,
      drawing_id: drawingId,
      status: "queued",
      requested_by: user.id
    });
    if (jobError) throw jobError;

    return NextResponse.json({ drawingId, status: "queued", traceId }, { status: 201 });
  } catch (error) {
    console.error("drawing upload failed", { traceId, error });
    const message = error instanceof Error ? error.message : "";
    const status = error instanceof z.ZodError ? 400 : error instanceof Error && error.name === "RateLimitError" ? 429 : ["DrawingQuotaExceeded", "SubscriptionInactive"].includes(message) ? 402 : 500;
    const publicError = status === 400 ? "Invalid request" : status === 429 ? "Too many uploads" : message === "DrawingQuotaExceeded" ? "Monthly drawing limit reached for this plan" : message === "SubscriptionInactive" ? "Subscription is not active" : "Unable to upload drawing";
    return NextResponse.json({ error: publicError, traceId }, { status });
  }
}
