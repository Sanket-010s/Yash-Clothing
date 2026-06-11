"use client";

/* Customization section commented out */


import { useState, useRef } from "react";
import { useToast } from "@/components/ToastProvider";
import { useAuthStore } from "@/store/authStore";
import { useDesignStore } from "@/store/designStore";

const colorOptions = ["#ffffff", "#1a1a1a", "#f5a623", "#1d8f4a", "#0f4c81"];
const fontColorPresets = [
  "#1A1A1A",
  "#FFFFFF",
  "#F5A623",
  "#C0392B",
  "#27AE60",
  "#0f4c81",
  "#8E44AD",
  "#E91E63",
];
const tools = ["Upload", "Text", "Font", "Color", "Size"];
const sizes = ["S", "M", "L", "XL"];
const alignOptions = ["left", "center", "right"];

// /* ── SVG icons for alignment ── */
// const AlignIcon = ({ align, active }) => {

/* ── SVG icons for alignment ── */
const AlignIcon = ({ align, active }) => {
  const barWidths =
    align === "left"
      ? [14, 10, 12]
      : align === "right"
        ? [14, 10, 12]
        : [14, 10, 14];

  const getX = (w) => {
    if (align === "left") return 1;
    if (align === "right") return 15 - w;
    return (16 - w) / 2;
  };

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={active ? "text-accent" : "text-text-secondary"}
    >
      {barWidths.map((w, i) => (
        <rect
          key={i}
          x={getX(w)}
          y={2 + i * 5}
          width={w}
          height={3}
          rx={1}
          fill="currentColor"
        />
      ))}
    </svg>
  );
};

export default function CanvasEditor() {
  const {
    shirtColor,
    text,
    uploadedImage,
    textColor,
    textAlign,
    imageAlign,
    imageScale,
    setShirtColor,
    setText,
    setUploadedImage,
    setTextColor,
    setTextAlign,
    setImageAlign,
    setImageScale,
  } = useDesignStore();

  const user = useAuthStore((state) => state.user);
  const { showToast } = useToast();
  const fileRef = useRef(null);

  const [inputText, setInputText] = useState(text);
  const [side, setSide] = useState("front");
  const [activeTool, setActiveTool] = useState("Text");
  const [selectedSize, setSelectedSize] = useState("M");
  const [history, setHistory] = useState([]);

  /* ── History / Undo ── */
  const pushHistory = () => {
    setHistory((prev) =>
      [
        ...prev,
        { shirtColor, text, uploadedImage, textColor, textAlign, imageAlign, imageScale },
      ].slice(-15)
    );
  };

  const undo = () => {
    if (history.length === 0) {
      showToast("Nothing to undo", "warning");
      return;
    }
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setShirtColor(previous.shirtColor);
    setText(previous.text);
    setInputText(previous.text);
    setUploadedImage(previous.uploadedImage);
    setTextColor(previous.textColor);
    setTextAlign(previous.textAlign);
    setImageAlign(previous.imageAlign);
    setImageScale(previous.imageScale);
  };

  /* ── Actions ── */
  const applyText = () => {
    pushHistory();
    setText(inputText);
    showToast("Text applied", "info");
  };

  const pickColor = (color) => {
    pushHistory();
    setShirtColor(color);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file", "warning");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be under 5 MB", "warning");
      return;
    }

    pushHistory();
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
      showToast("Artwork uploaded & placed on shirt", "success");
    };
    reader.onerror = () => {
      showToast("Failed to read the file", "danger");
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    pushHistory();
    setUploadedImage(null);
    if (fileRef.current) fileRef.current.value = "";
    showToast("Artwork removed", "info");
  };

  const changeTextColor = (color) => {
    pushHistory();
    setTextColor(color);
  };

  const changeTextAlign = (align) => {
    pushHistory();
    setTextAlign(align);
  };

  const changeImageAlign = (align) => {
    pushHistory();
    setImageAlign(align);
  };

  const changeImageScale = (scale) => {
    pushHistory();
    setImageScale(Number(scale));
  };

  /* ── Alignment helper ── */
  const alignToFlex = (align) =>
    align === "left"
      ? "flex-start"
      : align === "right"
        ? "flex-end"
        : "center";

  /* ── Render ── */
  return (
    <section className="space-y-6">
      <div className="space-y-4">
        {/* Front / Back toggle + Undo */}
        <div className="flex items-center justify-between">
          <div className="inline-flex rounded-full bg-surface p-1">
            {["front", "back"].map((panel) => (
              <button
                key={panel}
                type="button"
                onClick={() => setSide(panel)}
                className={`rounded-full px-4 py-2 text-[13px] font-semibold capitalize ${side === panel ? "bg-primary text-white" : "text-text-secondary"}`}
              >
                {panel}
              </button>
            ))}
          </div>

          <button type="button" className="btn-ghost px-3" onClick={undo}>
            Undo
          </button>
        </div>

        {/* ── T-Shirt Canvas ── */}
        <div className="mt-4 flex justify-center rounded-xl border border-border bg-background p-4">
          <div
            className="relative flex h-[360px] w-[260px] items-center justify-center rounded-[28px] border border-border transition-colors duration-300"
            style={{ backgroundColor: shirtColor }}
          >
            {/* Design area */}
            <div className="absolute left-6 right-6 top-14 bottom-16 flex flex-col gap-2 rounded-md border border-dashed border-accent/60 p-2 overflow-hidden">
              {/* Corner handles */}
              <span className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent" />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent" />
              <span className="absolute -bottom-1 -left-1 h-2.5 w-2.5 rounded-full bg-accent" />
              <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-accent" />

              {/* Uploaded image */}
              {uploadedImage && (
                <div
                  className="flex w-full shrink-0"
                  style={{ justifyContent: alignToFlex(imageAlign) }}
                >
                  <img
                    src={uploadedImage}
                    alt="Custom artwork"
                    className="rounded object-contain transition-transform duration-200"
                    style={{
                      maxWidth: `${imageScale}%`,
                      maxHeight: "140px",
                    }}
                    draggable={false}
                  />
                </div>
              )}

              {/* Design text */}
              {(text || (!uploadedImage && !text)) && (
                <div
                  className="w-full"
                  style={{ textAlign: textAlign }}
                >
                  <span
                    className="text-[15px] font-semibold leading-tight break-words"
                    style={{ color: textColor }}
                  >
                    {text || `${side} design`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Tool Tabs ── */}
        <div className="-mx-4 mt-4 overflow-x-auto border-t border-border px-4">
          <div className="flex min-w-max gap-4 pt-2">
            {tools.map((tool) => (
              <button
                key={tool}
                type="button"
                className={`pb-2 text-body ${activeTool === tool ? "border-b-2 border-accent font-semibold text-primary" : "text-text-secondary"}`}
                onClick={() => setActiveTool(tool)}
              >
                {tool}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tool Panels ── */}
      <div className="space-y-4 border-t border-border pt-4">
        {/* ─── Upload ─── */}
        {activeTool === "Upload" ? (
          <div className="space-y-3">
            <label htmlFor="upload-file" className="label">
              Upload Artwork
            </label>
            <input
              id="upload-file"
              ref={fileRef}
              type="file"
              accept="image/*"
              className="input file:mr-3 file:rounded-md file:border-0 file:bg-surface file:px-3 file:py-1.5 file:text-caption file:text-text-primary"
              onChange={handleFileUpload}
            />

            {uploadedImage ? (
              <div className="space-y-3">
                {/* Thumbnail preview */}
                <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-2">
                  <img
                    src={uploadedImage}
                    alt="Preview"
                    className="h-12 w-12 rounded object-cover"
                  />
                  <span className="text-caption text-text-secondary flex-1">
                    Artwork uploaded
                  </span>
                  <button
                    type="button"
                    className="text-caption font-semibold text-danger hover:underline"
                    onClick={removeImage}
                  >
                    Remove
                  </button>
                </div>

                {/* Image alignment */}
                <div className="space-y-1.5">
                  <p className="label">Image Alignment</p>
                  <div className="flex gap-2">
                    {alignOptions.map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => changeImageAlign(align)}
                        className={`flex min-w-[56px] items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-caption capitalize ${
                          imageAlign === align
                            ? "bg-accent/15 border border-accent text-primary font-semibold"
                            : "border border-border bg-background text-text-secondary"
                        }`}
                      >
                        <AlignIcon align={align} active={imageAlign === align} />
                        {align}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image scale */}
                <div className="space-y-1.5">
                  <p className="label">Image Scale — {imageScale}%</p>
                  <input
                    type="range"
                    min="25"
                    max="200"
                    step="5"
                    value={imageScale}
                    onChange={(e) => changeImageScale(e.target.value)}
                    className="w-full accent-accent"
                  />
                  <div className="flex justify-between text-[11px] text-muted">
                    <span>25%</span>
                    <span>100%</span>
                    <span>200%</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-caption text-text-secondary">
                No file selected yet. Upload PNG, JPG or SVG (max 5 MB).
              </p>
            )}
          </div>
        ) : null}

        {/* ─── Text ─── */}
        {activeTool === "Text" ? (
          <div className="space-y-3">
            <label htmlFor="design-text" className="label">
              Design Text
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="design-text"
                className="input"
                placeholder="Type your custom text"
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
              />
              <button type="button" className="btn-secondary sm:w-40" onClick={applyText}>
                Apply
              </button>
            </div>

            {/* Text alignment */}
            <div className="space-y-1.5">
              <p className="label">Text Alignment</p>
              <div className="flex gap-2">
                {alignOptions.map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => changeTextAlign(align)}
                    className={`flex min-w-[56px] items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-caption capitalize ${
                      textAlign === align
                        ? "bg-accent/15 border border-accent text-primary font-semibold"
                        : "border border-border bg-background text-text-secondary"
                    }`}
                  >
                    <AlignIcon align={align} active={textAlign === align} />
                    {align}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* ─── Font Color ─── */}
        {activeTool === "Font" ? (
          <div className="space-y-3">
            <p className="label">Font Color</p>

            {/* Preset swatches */}
            <div className="flex flex-wrap gap-2">
              {fontColorPresets.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Font color ${color}`}
                  onClick={() => changeTextColor(color)}
                  className={`h-9 w-9 rounded-full border-2 transition-transform ${
                    textColor === color
                      ? "border-accent scale-110 ring-2 ring-accent/30"
                      : "border-border hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Custom color picker */}
            <div className="flex items-center gap-3">
              <label htmlFor="custom-font-color" className="text-caption text-text-secondary">
                Custom:
              </label>
              <div className="relative">
                <input
                  id="custom-font-color"
                  type="color"
                  value={textColor}
                  onChange={(e) => changeTextColor(e.target.value)}
                  className="h-9 w-9 cursor-pointer rounded-full border-2 border-border p-0.5"
                />
              </div>
              <span
                className="inline-block rounded-md border border-border px-2 py-1 text-caption font-mono"
                style={{ color: textColor }}
              >
                {textColor}
              </span>
            </div>

            {/* Live preview */}
            <div
              className="rounded-lg border border-border bg-surface p-3 text-center"
              style={{ backgroundColor: shirtColor }}
            >
              <span className="text-body font-semibold" style={{ color: textColor }}>
                {text || "Preview text"}
              </span>
            </div>
          </div>
        ) : null}

        {/* ─── Shirt Color ─── */}
        {activeTool === "Color" ? (
          <div className="space-y-2">
            <p className="label">Shirt Color</p>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Select ${color}`}
                  onClick={() => pickColor(color)}
                  className={`h-9 w-9 rounded-full border-2 transition-transform ${shirtColor === color ? "border-accent scale-110 ring-2 ring-accent/30" : "border-border hover:scale-105"}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        ) : null}

        {/* ─── Size ─── */}
        {activeTool === "Size" ? (
          <div className="space-y-2">
            <p className="label">Size</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-12 rounded-lg px-3 py-2 text-body ${selectedSize === size ? "bg-primary text-white" : "border border-border bg-background text-primary"}`}
                >
                  {size}
                </button>
              ))}
              <span className="rounded-lg border border-border bg-surface px-3 py-2 text-body text-sold line-through">XXL</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* ── Action buttons ── */}
      <div className="space-y-2 border-t border-border pt-4">
        <button type="button" className="btn-primary w-full" onClick={() => showToast("Preview is ready", "info")}>
          Preview
        </button>
        {user ? (
          <button type="button" className="btn-secondary w-full" onClick={() => showToast("Design saved to your account", "success")}>
            Save Design
          </button>
        ) : null}
        <button
          type="button"
          className="btn-primary w-full"
          onClick={() => showToast(`Custom ${selectedSize} tee added to cart`, "success")}
        >
          Add to Cart
        </button>
      </div>
    </section>
  );
}
