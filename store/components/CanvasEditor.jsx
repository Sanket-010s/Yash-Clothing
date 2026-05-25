"use client";

import { useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { useAuthStore } from "@/store/authStore";
import { useDesignStore } from "@/store/designStore";

const colorOptions = ["#ffffff", "#1a1a1a", "#f5a623", "#1d8f4a", "#0f4c81"];
const tools = ["Upload", "Text", "Color", "Size"];
const sizes = ["S", "M", "L", "XL"];

export default function CanvasEditor() {
  const { shirtColor, text, setShirtColor, setText } = useDesignStore();
  const user = useAuthStore((state) => state.user);
  const { showToast } = useToast();

  const [inputText, setInputText] = useState(text);
  const [side, setSide] = useState("front");
  const [activeTool, setActiveTool] = useState("Text");
  const [selectedSize, setSelectedSize] = useState("M");
  const [history, setHistory] = useState([]);
  const [uploadLabel, setUploadLabel] = useState("");

  const pushHistory = () => {
    setHistory((prev) => [...prev, { shirtColor, text }].slice(-15));
  };

  const applyText = () => {
    pushHistory();
    setText(inputText);
    showToast("Text applied", "info");
  };

  const pickColor = (color) => {
    pushHistory();
    setShirtColor(color);
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
  };

  return (
    <section className="space-y-6">
      <div className="space-y-4">
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

        <div className="mt-4 flex justify-center rounded-xl border border-border bg-background p-4">
          <div
            className="relative flex h-[360px] w-[260px] items-center justify-center rounded-[28px] border border-border"
            style={{ backgroundColor: shirtColor }}
          >
            <div className="absolute left-8 right-8 top-16 rounded-md border border-dashed border-accent p-2 text-center">
              <span className="text-body font-semibold text-text-primary">{text || `${side} design text`}</span>
              <span className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent" />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent" />
              <span className="absolute -bottom-1 -left-1 h-2.5 w-2.5 rounded-full bg-accent" />
              <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-accent" />
            </div>
          </div>
        </div>

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

      <div className="space-y-4 border-t border-border pt-4">
        {activeTool === "Upload" ? (
          <div className="space-y-2">
            <label htmlFor="upload-file" className="label">
              Upload Artwork
            </label>
            <input
              id="upload-file"
              type="file"
              className="input file:mr-3 file:rounded-md file:border-0 file:bg-surface file:px-3 file:py-1.5 file:text-caption file:text-text-primary"
              onChange={(event) => {
                const name = event.target.files?.[0]?.name || "";
                setUploadLabel(name);
                if (name) {
                  showToast("Artwork ready for placement", "success");
                }
              }}
            />
            <p className="text-caption text-text-secondary">{uploadLabel || "No file selected yet."}</p>
          </div>
        ) : null}

        {activeTool === "Text" ? (
          <div className="space-y-2">
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
          </div>
        ) : null}

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
                  className={`h-9 w-9 rounded-full border-2 ${shirtColor === color ? "border-accent" : "border-border"}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        ) : null}

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
