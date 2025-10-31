"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { createApplicationsWorkbookBlob } from "@/lib/exportToExcel";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  HStack,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Tag,
  useToast,
  Spacer,
  Divider
} from "@chakra-ui/react";

type StatusType = "waiting" | "interview" | "rejected" | "hired";

type ApplicationRecord = {
  id: string;
  user_id: string;
  company: string;
  position: string;
  applied_at: string;
  status: StatusType;
  notes?: string | null;
};

const STATUS_OPTIONS: StatusType[] = ["waiting", "interview", "rejected", "hired"];

const statusColor: Record<StatusType, string> = {
  waiting: "yellow",
  interview: "blue",
  rejected: "red",
  hired: "green"
};

function StatCard({
  title,
  value,
  color
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <Box
      bg="rgba(15,23,42,0.4)"
      border="1px solid rgba(148,163,184,0.15)"
      rounded="xl"
      p={4}
      boxShadow="0 0 30px rgba(59,130,246,0.12)"
    >
      <Text fontSize="sm" color="whiteAlpha.600">
        {title}
      </Text>
      <Heading size="xl" mt={2} color={color}>
        {value}
      </Heading>
    </Box>
  );
}

function FilterPill({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      size="sm"
      variant={active ? "solid" : "outline"}
      bg={active ? "blue.500" : "transparent"}
      borderColor="whiteAlpha.300"
      _hover={{ bg: active ? "blue.400" : "whiteAlpha.100" }}
      onClick={onClick}
      textTransform="capitalize"
    >
      {label}
    </Button>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const toast = useToast();
  const [userEmail, setUserEmail] = useState("");
  const [apps, setApps] = useState<ApplicationRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | StatusType>("all");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [form, setForm] = useState({
    id: "",
    company: "",
    position: "",
    applied_at: new Date().toISOString().slice(0, 10),
    status: "waiting" as StatusType,
    notes: ""
  });

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();
      if (error || !user) {
        router.replace("/");
        return;
      }
      setUserEmail(user.email ?? "");

      const { data, error: appsErr } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user.id)
        .order("applied_at", { ascending: false });

      if (appsErr) {
        toast({
          title: "Failed to load",
          description: appsErr.message,
          status: "error"
        });
        return;
      }

      setApps((data || []) as ApplicationRecord[]);
    };
    load();
  }, [router, toast]);

  const filtered = useMemo(() => {
    if (activeFilter === "all") return apps;
    return apps.filter((a) => a.status === activeFilter);
  }, [apps, activeFilter]);

  const stats = useMemo(() => {
    return {
      total: apps.length,
      interview: apps.filter((a) => a.status === "interview").length,
      rejected: apps.filter((a) => a.status === "rejected").length,
      hired: apps.filter((a) => a.status === "hired").length
    };
  }, [apps]);

  const openCreate = () => {
    setForm({
      id: "",
      company: "",
      position: "",
      applied_at: new Date().toISOString().slice(0, 10),
      status: "waiting",
      notes: ""
    });
    onOpen();
  };

  const openEdit = (app: ApplicationRecord) => {
    setForm({
      id: app.id,
      company: app.company,
      position: app.position,
      applied_at: app.applied_at,
      status: app.status,
      notes: app.notes || ""
    });
    onOpen();
  };

  const handleSave = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/");
      return;
    }

    const payload = {
      user_id: user.id,
      company: form.company,
      position: form.position,
      applied_at: form.applied_at,
      status: form.status,
      notes: form.notes
    };

    if (form.id) {
      const { data, error } = await supabase
        .from("applications")
        .update(payload)
        .eq("id", form.id)
        .select();
      if (error) {
        toast({ title: "Failed to update", description: error.message, status: "error" });
        return;
      }
      setApps((prev) => prev.map((p) => (p.id === form.id ? (data?.[0] as any) : p)));
    } else {
      const { data, error } = await supabase
        .from("applications")
        .insert(payload)
        .select();
      if (error) {
        toast({ title: "Failed to create", description: error.message, status: "error" });
        return;
      }
      setApps((prev) => [data?.[0] as any, ...prev]);
    }

    toast({ title: "Saved", status: "success" });
    onClose();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, status: "error" });
      return;
    }
    setApps((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Deleted", status: "success" });
  };

  const handleExport = async () => {
    if (!filtered.length) {
      toast({ title: "No data to export", status: "info" });
      return;
    }
    const { saveAs } = await import("file-saver");
    const blob = createApplicationsWorkbookBlob(filtered);
    saveAs(blob, "jobtrackr-applications.xlsx");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <Box minH="100vh" bg="#0F172A" color="white" px={{ base: 4, md: 10 }} py={6}>
      {/* Header */}
      <Flex align="center" mb={6} gap={4}>
        <Box>
          <Heading size="lg">Hi, {userEmail || "User"}</Heading>
          <Text color="whiteAlpha.700">
            Pantau status lamaran kerja Anda dan kelola semuanya dalam satu tempat.
          </Text>
        </Box>
        <Spacer />
        <HStack gap={3}>
          <Button
            onClick={handleExport}
            colorScheme="green"
            variant="solid"
            boxShadow="0 0 16px rgba(34,197,94,0.4)"
          >
            Export to Excel
          </Button>
          <Button
            onClick={openCreate}
            bg="blue.500"
            _hover={{ bg: "blue.400" }}
            boxShadow="0 0 16px rgba(59,130,246,0.5)"
          >
            Add Application
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            borderColor="whiteAlpha.400"
            _hover={{ bg: "whiteAlpha.200" }}
          >
            Logout
          </Button>
        </HStack>
      </Flex>

      {/* Stats */}
      <SimpleGrid columns={{ base: 1, md: 4 }} gap={4} mb={6}>
        <StatCard title="Total Applications" value={stats.total} color="cyan.400" />
        <StatCard title="Total Interview" value={stats.interview} color="yellow.300" />
        <StatCard title="Total Rejected" value={stats.rejected} color="red.300" />
        <StatCard title="Total Hired" value={stats.hired} color="green.300" />
      </SimpleGrid>

      {/* Filter */}
      <Box
        bg="rgba(15,23,42,0.5)"
        border="1px solid rgba(148,163,184,0.1)"
        rounded="xl"
        p={3}
        mb={4}
      >
        <Text mb={2} fontWeight="semibold">
          Filter Status
        </Text>
        <HStack gap={3}>
          <FilterPill label="All" active={activeFilter === "all"} onClick={() => setActiveFilter("all")} />
          {STATUS_OPTIONS.map((st) => (
            <FilterPill
              key={st}
              label={st}
              active={activeFilter === st}
              onClick={() => setActiveFilter(st)}
            />
          ))}
        </HStack>
      </Box>

      {/* Table */}
      <Box
        bg="rgba(15,23,42,0.5)"
        border="1px solid rgba(148,163,184,0.08)"
        rounded="xl"
        overflow="hidden"
        boxShadow="0 0 35px rgba(15,118,255,0.12)"
      >
        <Table variant="simple">
          <Thead bg="whiteAlpha.100">
            <Tr>
              <Th color="white">Company</Th>
              <Th color="white">Position</Th>
              <Th color="white">Applied</Th>
              <Th color="white">Status</Th>
              <Th color="white">Notes</Th>
              <Th color="white">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map((app) => (
              <Tr key={app.id} _hover={{ bg: "whiteAlpha.50" }}>
                <Td>{app.company}</Td>
                <Td>{app.position}</Td>
                <Td>{app.applied_at}</Td>
                <Td>
                  <Tag size="sm" colorScheme={statusColor[app.status]} textTransform="capitalize">
                    {app.status}
                  </Tag>
                </Td>
                <Td maxW="240px" whiteSpace="normal">
                  {app.notes}
                </Td>
                <Td>
                  <HStack>
                    <Button size="sm" variant="outline" onClick={() => openEdit(app)}>
                      Edit
                    </Button>
                    <Button size="sm" colorScheme="red" variant="solid" onClick={() => handleDelete(app.id)}>
                      Delete
                    </Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
            {!filtered.length && (
              <Tr>
                <Td colSpan={6}>
                  <Text py={6} textAlign="center" color="whiteAlpha.500">
                    No applications found.
                  </Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(6px)" />
        <ModalContent bg="#0F172A" border="1px solid rgba(148,163,184,0.25)">
          <ModalHeader>{form.id ? "Edit Application" : "Add New Application"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={4}>
            <Flex gap={4} direction={{ base: "column", md: "row" }}>
              <Box flex="1">
                <FormControl mb={3} isRequired>
                  <FormLabel>Company</FormLabel>
                  <Input
                    bg="whiteAlpha.100"
                    border="none"
                    value={form.company}
                    onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                  />
                </FormControl>
                <FormControl mb={3} isRequired>
                  <FormLabel>Position</FormLabel>
                  <Input
                    bg="whiteAlpha.100"
                    border="none"
                    value={form.position}
                    onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
                  />
                </FormControl>
                <FormControl mb={3} isRequired>
                  <FormLabel>Applied At</FormLabel>
                  <Input
                    type="date"
                    bg="whiteAlpha.100"
                    border="none"
                    value={form.applied_at}
                    onChange={(e) => setForm((p) => ({ ...p, applied_at: e.target.value }))}
                  />
                </FormControl>
              </Box>
              <Box flex="1">
                <FormControl mb={3} isRequired>
                  <FormLabel>Status</FormLabel>
                  <Select
                    bg="whiteAlpha.100"
                    border="none"
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as StatusType }))}
                  >
                    <option value="waiting">waiting</option>
                    <option value="interview">interview</option>
                    <option value="rejected">rejected</option>
                    <option value="hired">hired</option>
                  </Select>
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Notes</FormLabel>
                  <Textarea
                    rows={5}
                    bg="whiteAlpha.100"
                    border="none"
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  />
                </FormControl>
              </Box>
            </Flex>
          </ModalBody>
          <Divider borderColor="whiteAlpha.200" />
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSave}>
              {form.id ? "Save Changes" : "Create Application"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
