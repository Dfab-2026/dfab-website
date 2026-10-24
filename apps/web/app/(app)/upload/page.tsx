import { QuickDrawingAnalyze } from "@/components/quick-drawing-analyze";
import { requireRole } from "@/lib/security/auth";

export default async function UploadStartPage() {
  await requireRole(["owner", "admin", "estimator"]);

  return (
    <>
      <div className="page-head upload-page-head">
        <div>
          <span className="eyebrow">Step 1 of 3</span>
          <h1>Upload drawing</h1>
          <p>Upload the engineering drawing package and let AI extract the quotation-ready manufacturing data.</p>
        </div>
      </div>

      <div className="flow-progress" aria-label="Quotation progress">
        <div className="flow-progress-item active"><span>1</span><strong>Upload & analyze</strong></div>
        <div className="flow-progress-line" />
        <div className="flow-progress-item"><span>2</span><strong>Analyzed data</strong></div>
        <div className="flow-progress-line" />
        <div className="flow-progress-item"><span>3</span><strong>Quotation</strong></div>
      </div>

      <section className="card upload-focus-card">
        <div className="upload-focus-intro">
          <div>
            <span className="eyebrow">Engineering drawing input</span>
            <h2>One place for every drawing format</h2>
            <p>The file is stored privately, queued for AI analysis and then opened in an editable engineering-data review screen.</p>
          </div>
          <div className="upload-security-chip">Private company workspace</div>
        </div>
        <QuickDrawingAnalyze />
      </section>
    </>
  );
}
