"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const ACCEPTED = ".pdf,.png,.jpg,.jpeg,.tif,.tiff,.webp,.dxf,.dwg,.step,.stp,.iges,.igs,.zip";

function titleFromFiles(files: File[]) {
  if (!files.length) return "New drawing quotation";
  const first = files[0].name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
  return files.length > 1 ? `${first || "Drawing"} package` : first || "New drawing quotation";
}

export function QuickDrawingAnalyze() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const router = useRouter();

  const totalMb = useMemo(
    () => files.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024,
    [files]
  );

  async function analyze() {
    if (!files.length) {
      setError("Choose at least one engineering drawing to analyze.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      setProgress("Creating secure quotation workspace…");
      const rfqResponse = await fetch("/api/rfqs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: titleFromFiles(files),
          currency: "INR"
        })
      });
      const rfqResult = await rfqResponse.json().catch(() => ({}));
      if (!rfqResponse.ok || !rfqResult?.data?.id) {
        throw new Error(rfqResult?.error ?? "Unable to create quotation workspace");
      }

      const rfqId = String(rfqResult.data.id);

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        setProgress(`Uploading & queuing ${index + 1} of ${files.length}: ${file.name}`);
        const body = new FormData();
        body.set("file", file);
        const response = await fetch(`/api/rfqs/${rfqId}/drawings`, {
          method: "POST",
          body
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(result?.error ?? `Unable to upload ${file.name}`);
        }
      }

      setProgress("AI analysis queued. Opening analyzed drawing data…");
      router.push(`/rfqs/${rfqId}/review`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to analyze drawing");
      setBusy(false);
      setProgress("");
    }
  }

  return (
    <div className="quick-analyze-card">
      <label className={`drawing-dropzone quick-dropzone${files.length ? " has-files" : ""}`} htmlFor="quick-drawing-files">
        <span className="drawing-dropzone-icon">⇧</span>
        <strong>{files.length ? `${files.length} drawing${files.length === 1 ? "" : "s"} selected` : "Drop engineering drawings here"}</strong>
        <span>or click to browse from your computer</span>
        <small>PDF · JPG/PNG/TIFF/WebP · DXF · DWG · STEP/STP · IGES/IGS · ZIP · max 25 MB per file</small>
        <input
          id="quick-drawing-files"
          type="file"
          accept={ACCEPTED}
          multiple
          disabled={busy}
          onChange={(event) => {
            const selected = Array.from(event.target.files ?? []);
            setFiles(selected);
            setError("");
          }}
        />
      </label>

      {files.length > 0 && (
        <div className="quick-file-list" aria-label="Selected drawings">
          {files.map((file) => (
            <div className="quick-file-row" key={`${file.name}-${file.lastModified}`}>
              <div>
                <strong>{file.name}</strong>
                <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <button
                className="btn btn-sm"
                type="button"
                disabled={busy}
                onClick={() => setFiles((current) => current.filter((item) => item !== file))}
              >
                Remove
              </button>
            </div>
          ))}
          <div className="quick-file-total">Total selected size: {totalMb.toFixed(2)} MB</div>
        </div>
      )}

      {progress && <div className="upload-progress" role="status">{progress}</div>}
      {error && <div className="error" role="alert">{error}</div>}

      <div className="quick-analyze-actions">
        <div>
          <strong>AI engineering analysis</strong>
          <span>Reads drawing identity, revision, material, quantity, dimensions, weight and manufacturing notes.</span>
        </div>
        <button className="btn btn-primary btn-analyze" type="button" disabled={busy || !files.length} onClick={analyze}>
          {busy ? "Analyzing…" : "Analyze Drawing →"}
        </button>
      </div>
    </div>
  );
}
