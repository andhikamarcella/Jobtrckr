"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Textarea
} from "@chakra-ui/react";
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formState);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Stack spacing={4}>
        <FormControl isRequired>
          <FormLabel htmlFor="company">Company</FormLabel>
          <Input id="company" name="company" value={formState.company} onChange={handleChange} />
        </FormControl>

        <FormControl isRequired>
          <FormLabel htmlFor="position">Position</FormLabel>
          <Input id="position" name="position" value={formState.position} onChange={handleChange} />
        </FormControl>

        <FormControl isRequired>
          <FormLabel htmlFor="applied_at">Applied At</FormLabel>
          <Input
            type="date"
            id="applied_at"
            name="applied_at"
            value={formState.applied_at}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel htmlFor="status">Status</FormLabel>
          <Select id="status" name="status" value={formState.status} onChange={handleChange}>
            {STATUS_SELECT_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="notes">Notes</FormLabel>
          <Textarea id="notes" name="notes" value={formState.notes ?? ""} onChange={handleChange} rows={4} />
        </FormControl>

        <ButtonGroup justifyContent="flex-end" pt={2}>
          <Button variant="outline" onClick={onCancel} isDisabled={isSubmitting}>
            Cancel
          </Button>
          <Button colorScheme="blue" type="submit" isLoading={isSubmitting}>
            {isEditMode ? "Update Application" : "Create Application"}
          </Button>
        </ButtonGroup>
      </Stack>
    </Box>
  );
}
