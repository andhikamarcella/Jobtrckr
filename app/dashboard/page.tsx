"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { createApplicationsWorkbookBlob } from "@/lib/exportToExcel";
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Spacer,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  Tag,
  useDisclosure,
  useToast,
  Spinner
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

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const [userEmail, setUserEmail] = useState("");
  const [apps, setApps] = useState<ApplicationRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | StatusType>("all");
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [form, setForm] = useState<{
    id?: string;
    company: string;
    position: string;
    applied_at: string;
    status: StatusType;
    notes: string;
  }>({
    company: "",
    position: "",
    applied_at: new Date().toISOString().slice(0, 10),
    status: "waiting",
    notes: ""
  });

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (error || !user) {
        router.replace("/");
        setLoading(false);
        return;
      }

      setUserEmail(user.email ?? "");

      const { data, error: appsErr } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user.id)
        .order("applied_at", { ascending: false });

      if (!isMounted) {
        return;
      }

      if (appsErr) {
        console.error(appsErr);
        toast({
          title: "Failed to load applications",
          description: appsErr.message,
          status: "error"
        });
        setApps([]);
      } else {
        setApps((data ?? []) as ApplicationRecord[]);
      }

      setLoading(false);
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [router, toast]);

  const filteredApps = useMemo(() => {
    if (activeFilter === "all") return apps;
    return apps.filter((a) => a.status === activeFilter);
  }, [apps, activeFilter]);

  const stats = useMemo(() => {
    const total = apps.length;
    const interview = apps.filter((a) => a.status === "interview").length;
    const rejected = apps.filter((a) => a.status === "rejected").length;
    const hired = apps.filter((a) => a.status === "hired").length;
    return { total, interview, rejected, hired };
  }, [apps]);

  const openCreate = () => {
    setForm({
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
      notes: app.notes ?? ""
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

    if (!form.company || !form.position || !form.applied_at) {
      toast({
        title: "Please fill all required fields",
        status: "warning"
      });
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

    let error: unknown;
    if (form.id) {
      const { error: updErr, data } = await supabase
        .from("applications")
        .update(payload)
        .eq("id", form.id)
        .eq("user_id", user.id)
        .select();
      error = updErr;
      if (!updErr && data) {
        const updated = data[0] as ApplicationRecord;
        setApps((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      }
    } else {
      const { error: insErr, data } = await supabase
        .from("applications")
        .insert(payload)
        .select();
      error = insErr;
      if (!insErr && data) {
        const inserted = data[0] as ApplicationRecord;
        setApps((prev) => [inserted, ...prev]);
      }
    }

    if (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({ title: "Failed to save application", description: message, status: "error" });
      return;
    }

    toast({
      title: form.id ? "Application updated" : "Application created",
      status: "success"
    });
    onClose();
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Delete this application?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to delete", description: error.message, status: "error" });
      return;
    }

    setApps((prev) => prev.filter((item) => item.id !== id));
    toast({ title: "Application deleted", status: "success" });
  };

  const handleExport = async () => {
    if (!filteredApps.length) {
      toast({ title: "No data to export", status: "info" });
      return;
    }
    const { saveAs } = await import("file-saver");
    const blob = createApplicationsWorkbookBlob(filteredApps);
    saveAs(blob, "jobtrackr-applications.xlsx");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <Box minH="100vh" bg="#0F172A" color="white" px={{ base: 4, md: 10 }} py={6}>
      <Flex align="center" mb={6} gap={4} wrap="wrap">
        <Box>
          <Heading size="lg">Hi, {userEmail || "User"}</Heading>
          <Text color="whiteAlpha.700">
            Pantau status lamaran kerja Anda dan kelola semuanya dalam satu tempat.
          </Text>
        </Box>
        <Spacer />
        <HStack gap={3} flexWrap="wrap">
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

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4} mb={6}>
        <StatCard title="Total Applications" value={stats.total} color="cyan.400" />
        <StatCard title="Total Interview" value={stats.interview} color="yellow.300" />
        <StatCard title="Total Rejected" value={stats.rejected} color="red.300" />
        <StatCard title="Total Hired" value={stats.hired} color="green.300" />
      </SimpleGrid>

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
        <HStack gap={3} flexWrap="wrap">
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
            {loading ? (
              <Tr>
                <Td colSpan={6} py={12} textAlign="center">
                  <Spinner size="lg" color="blue.300" />
                </Td>
              </Tr>
            ) : (
              <>
                {filteredApps.map((app) => (
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
                      <HStack spacing={2}>
                        <Button size="sm" variant="outline" onClick={() => openEdit(app)}>
                          Edit
                        </Button>
                        <Button size="sm" colorScheme="red" onClick={() => handleDelete(app.id)}>
                          Delete
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
                {!filteredApps.length && (
                  <Tr>
                    <Td colSpan={6} py={10} textAlign="center">
                      <Text color="whiteAlpha.600">No applications found.</Text>
                    </Td>
                  </Tr>
                )}
              </>
            )}
          </Tbody>
        </Table>
      </Box>

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
                    color="white"
                    value={form.company}
                    onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))}
                  />
                </FormControl>
                <FormControl mb={3} isRequired>
                  <FormLabel>Position</FormLabel>
                  <Input
                    bg="whiteAlpha.100"
                    border="none"
                    color="white"
                    value={form.position}
                    onChange={(e) => setForm((prev) => ({ ...prev, position: e.target.value }))}
                  />
                </FormControl>
                <FormControl mb={3} isRequired>
                  <FormLabel>Applied At</FormLabel>
                  <Input
                    type="date"
                    bg="whiteAlpha.100"
                    border="none"
                    color="white"
                    value={form.applied_at}
                    onChange={(e) => setForm((prev) => ({ ...prev, applied_at: e.target.value }))}
                  />
                </FormControl>
              </Box>
              <Box flex="1">
                <FormControl mb={3} isRequired>
                  <FormLabel>Status</FormLabel>
                  <Select
                    bg="whiteAlpha.100"
                    border="none"
                    color="white"
                    value={form.status}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, status: e.target.value as StatusType }))
                    }
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
                    color="white"
                    value={form.notes}
                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
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
