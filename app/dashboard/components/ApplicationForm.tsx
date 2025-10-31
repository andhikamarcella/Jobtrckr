"use client";

import type { ChangeEvent, CSSProperties, FormEvent } from "react";
import { useEffect, useState } from "react";
import { STATUS_OPTIONS, type StatusFilterValue } from "./StatusFilter";

const STATUS_SELECT_OPTIONS = STATUS_OPTIONS.filter((status) => status !== "all");

type ApplicationStatus = Exclude<StatusFilterValue, "all">;

export interface ApplicationPayload {
  id?: string;
  company: string;
  position: string;
  applied_at: string;
  status: ApplicationStatus;
  notes?: string | null;
}

interface ApplicationFormProps {
  mode: "create" | "edit";
  initialData?: ApplicationPayload | null;
  onSubmit: (payload: ApplicationPayload) => Promise<void> | void;
  onCancel: () => void;
}

const defaultFormState: ApplicationPayload = {
  company: "",
  position: "",
  applied_at: new Date().toISOString().slice(0, 10),
  status: "waiting",
  notes: ""
};

export function ApplicationForm({ mode, initialData, onSubmit, onCancel }: ApplicationFormProps) {
  const [formState, setFormState] = useState<ApplicationPayload>(defaultFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = mode === "edit";

  useEffect(() => {
    if (initialData) {
      setFormState({
        ...defaultFormState,
        ...initialData,
        applied_at: initialData.applied_at.slice(0, 10)
      });
    } else {
      setFormState(defaultFormState);
    }
  }, [initialData]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formState);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <label style={labelStyle}>
        <span>Company</span>
        <input
          id="company"
          name="company"
          value={formState.company}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        <span>Position</span>
        <input
          id="position"
          name="position"
          value={formState.position}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        <span>Applied At</span>
        <input
          type="date"
          id="applied_at"
          name="applied_at"
          value={formState.applied_at}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        <span>Status</span>
        <select
          id="status"
          name="status"
          value={formState.status}
          onChange={handleChange}
          required
          style={{ ...inputStyle, appearance: "none" }}
        >
          {STATUS_SELECT_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <label style={labelStyle}>
        <span>Notes</span>
        <textarea
          id="notes"
          name="notes"
          value={formState.notes ?? ""}
          onChange={handleChange}
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </label>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "8px" }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          style={outlineButtonStyle}
        >
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} style={primaryButtonStyle}>
          {isEditMode ? "Update Application" : "Create Application"}
        </button>
      </div>
    </form>
  );
}

const labelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  fontSize: "14px",
  color: "rgba(255,255,255,0.8)"
};

const inputStyle: CSSProperties = {
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(148, 163, 184, 0.3)",
  background: "rgba(15, 23, 42, 0.6)",
  color: "white"
};

const outlineButtonStyle: CSSProperties = {
  padding: "10px 16px",
  borderRadius: "10px",
  border: "1px solid rgba(148, 163, 184, 0.4)",
  background: "transparent",
  color: "white",
  cursor: "pointer"
};

const primaryButtonStyle: CSSProperties = {
  padding: "10px 16px",
  borderRadius: "10px",
  border: "none",
  background: "#3b82f6",
  color: "white",
  fontWeight: 600,
  cursor: "pointer"
};
