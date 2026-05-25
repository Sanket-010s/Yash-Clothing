import CanvasEditor from "@/components/CanvasEditor";

export default function CustomizePage() {
  return (
    <div className="page-shell space-y-6 py-4 md:py-6">
      <div>
        <h1 className="text-page-title">Customize T-shirt</h1>
        <p className="text-body text-text-secondary">
          Create your own style. Full drag-and-drop designer comes in Phase 3.
        </p>
      </div>
      <CanvasEditor />
    </div>
  );
}
