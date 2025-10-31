"use client";

import { Button, Wrap, WrapItem } from "@chakra-ui/react";

const STATUS_OPTIONS = ["all", "waiting", "interview", "rejected", "hired"] as const;

export type StatusFilterValue = (typeof STATUS_OPTIONS)[number];

interface StatusFilterProps {
  activeStatus: StatusFilterValue;
  onChange: (status: StatusFilterValue) => void;
}

const getLabel = (status: StatusFilterValue) =>
  status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1);

export function StatusFilter({ activeStatus, onChange }: StatusFilterProps) {
  return (
    <Wrap spacing={2}>
      {STATUS_OPTIONS.map((status) => (
        <WrapItem key={status}>
          <Button
            size="sm"
            variant={activeStatus === status ? "solid" : "outline"}
            colorScheme="blue"
            onClick={() => onChange(status)}
          >
            {getLabel(status)}
          </Button>
        </WrapItem>
      ))}
    </Wrap>
  );
}

export { STATUS_OPTIONS };
