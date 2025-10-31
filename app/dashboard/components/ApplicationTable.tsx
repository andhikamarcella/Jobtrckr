"use client";

import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text
} from "@chakra-ui/react";
import type { ApplicationPayload } from "./ApplicationForm";

export interface ApplicationRecord extends ApplicationPayload {
  id: string;
  user_id?: string | null;
  created_at?: string | null;
}

interface ApplicationTableProps {
  applications: ApplicationRecord[];
  onEdit: (application: ApplicationRecord) => void;
  onDelete: (application: ApplicationRecord) => void;
}

const statusColor: Record<string, string> = {
  waiting: "yellow",
  interview: "blue",
  rejected: "red",
  hired: "green"
};

export function ApplicationTable({ applications, onEdit, onDelete }: ApplicationTableProps) {
  if (applications.length === 0) {
    return (
      <Box
        borderWidth="1px"
        borderStyle="dashed"
        borderColor="gray.600"
        bg="gray.800"
        rounded="lg"
        p={10}
        textAlign="center"
      >
        <Text color="gray.300">Belum ada data lamaran. Tambahkan data baru untuk mulai melacak.</Text>
      </Box>
    );
  }

  return (
    <TableContainer borderWidth="1px" borderColor="gray.700" rounded="lg" bg="gray.800" shadow="lg">
      <Table variant="simple" colorScheme="gray">
        <Thead bg="gray.700">
          <Tr>
            <Th color="gray.200">Company</Th>
            <Th color="gray.200">Position</Th>
            <Th color="gray.200">Applied</Th>
            <Th color="gray.200">Status</Th>
            <Th color="gray.200">Notes</Th>
            <Th color="gray.200" textAlign="right">
              Actions
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {applications.map((application) => (
            <Tr key={application.id} _hover={{ bg: "gray.700" }}>
              <Td fontWeight="semibold" color="gray.100">
                {application.company}
              </Td>
              <Td color="gray.200">{application.position}</Td>
              <Td color="gray.200">
                {new Date(application.applied_at).toLocaleDateString()}
              </Td>
              <Td>
                <Badge colorScheme={statusColor[application.status] ?? "gray"} textTransform="capitalize">
                  {application.status}
                </Badge>
              </Td>
              <Td maxW="280px">
                <Text color="gray.300" whiteSpace="pre-wrap">
                  {application.notes ?? "-"}
                </Text>
              </Td>
              <Td textAlign="right">
                <ButtonGroup size="sm" variant="outline" spacing={2}>
                  <Button onClick={() => onEdit(application)} colorScheme="blue">
                    Edit
                  </Button>
                  <Button onClick={() => onDelete(application)} colorScheme="red">
                    Delete
                  </Button>
                </ButtonGroup>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
