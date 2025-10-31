"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  ButtonGroup,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Spinner,
  Text
} from "@chakra-ui/react";
import { fetchApplicationsByStatus } from "@/lib/applications";
import { supabase } from "@/lib/supabaseClient";
import { ApplicationForm, type ApplicationPayload } from "./components/ApplicationForm";
import { ApplicationTable, type ApplicationRecord } from "./components/ApplicationTable";
import { ExportToExcel } from "./components/ExportToExcel";
import { StatusChart } from "./components/StatusChart";
import { StatusFilter, type StatusFilterValue } from "./components/StatusFilter";

const dummyApplications: ApplicationRecord[] = [
  {
    id: "dummy-1",
    user_id: "dummy-user",
    company: "OpenAI",
    position: "AI Researcher",
    applied_at: "2024-03-10",
    status: "waiting",
    notes: "Menunggu balasan HR melalui email."
  },
  {
    id: "dummy-2",
    user_id: "dummy-user",
    company: "Google",
    position: "Software Engineer",
    applied_at: "2024-02-22",
    status: "interview",
    notes: "Sudah melakukan interview tahap 1, menunggu jadwal onsite."
  },
  {
    id: "dummy-3",
    user_id: "dummy-user",
    company: "Startup Lokal",
    position: "Frontend Developer",
    applied_at: "2024-01-15",
    status: "rejected",
    notes: "Ditolak karena kurang pengalaman pada React Native."
  },
  {
    id: "dummy-4",
    user_id: "dummy-user",
    company: "Remote Corp",
    position: "Product Manager",
    applied_at: "2023-12-01",
    status: "hired",
    notes: "Telah menandatangani kontrak per Februari 2024."
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ApplicationRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedApplication, setSelectedApplication] = useState<ApplicationRecord | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingDummyData, setIsUsingDummyData] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadApplications = async (user: User) => {
      setIsLoading(true);
      try {
        const data = await fetchApplicationsByStatus(user.id);

        if (!data || data.length === 0) {
          setApplications(dummyApplications);
          setIsUsingDummyData(true);
        } else {
          setApplications(data as ApplicationRecord[]);
          setIsUsingDummyData(false);
        }
      } catch (error) {
        console.error(error);
        setFeedbackMessage("Gagal memuat data dari Supabase, menampilkan data contoh.");
        setApplications(dummyApplications);
        setIsUsingDummyData(true);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const initialize = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error(sessionError);
        setFeedbackMessage("Tidak dapat memeriksa sesi login saat ini.");
        setApplications(dummyApplications);
        setIsUsingDummyData(true);
        setIsLoading(false);
        return;
      }

      const session = sessionData.session;
      if (!session) {
        router.replace("/");
        return;
      }

      if (!isMounted) {
        return;
      }

      setCurrentUser(session.user);
      await loadApplications(session.user);
    };

    initialize();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) {
        return;
      }

      if (event === "SIGNED_OUT" || !session) {
        setCurrentUser(null);
        router.replace("/");
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredApplications(applications);
      return;
    }

    setFilteredApplications(applications.filter((application) => application.status === statusFilter));
  }, [applications, statusFilter]);

  const summary = useMemo(() => {
    const total = applications.length;
    const interview = applications.filter((application) => application.status === "interview").length;
    const rejected = applications.filter((application) => application.status === "rejected").length;
    const hired = applications.filter((application) => application.status === "hired").length;

    return {
      total,
      interview,
      rejected,
      hired
    };
  }, [applications]);

  const openCreateForm = () => {
    setFormMode("create");
    setSelectedApplication(null);
    setIsFormOpen(true);
  };

  const openEditForm = (application: ApplicationRecord) => {
    setFormMode("edit");
    setSelectedApplication(application);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedApplication(null);
  };

  const handleFilterChange = (status: StatusFilterValue) => {
    setStatusFilter(status);
  };

  const upsertLocalApplication = (application: ApplicationRecord) => {
    setApplications((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === application.id);
      if (existingIndex >= 0) {
        const clone = [...prev];
        clone[existingIndex] = application;
        return clone;
      }
      return [application, ...prev];
    });
  };

  const createApplication = async (payload: ApplicationPayload) => {
    if (!currentUser) {
      setFeedbackMessage("Session tidak ditemukan. Silakan login ulang.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("applications")
        .insert({
          user_id: currentUser.id,
          company: payload.company,
          position: payload.position,
          applied_at: payload.applied_at,
          status: payload.status,
          notes: payload.notes
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newRecord = data as ApplicationRecord;
      setApplications((prev) => {
        const base = isUsingDummyData ? [] : prev;
        return [newRecord, ...base];
      });
      setIsUsingDummyData(false);
      setFeedbackMessage("Lamaran berhasil ditambahkan.");
      closeForm();
    } catch (error) {
      console.error(error);
      setFeedbackMessage("Terjadi kesalahan saat menyimpan data.");
    }
  };

  const updateApplication = async (payload: ApplicationPayload) => {
    if (!payload.id) return;

    if (isUsingDummyData) {
      upsertLocalApplication(payload as ApplicationRecord);
      setFeedbackMessage("Perubahan tersimpan pada data contoh.");
      closeForm();
      return;
    }

    if (!currentUser) {
      setFeedbackMessage("Session tidak ditemukan. Silakan login ulang.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("applications")
        .update({
          company: payload.company,
          position: payload.position,
          applied_at: payload.applied_at,
          status: payload.status,
          notes: payload.notes
        })
        .eq("id", payload.id)
        .eq("user_id", currentUser.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      upsertLocalApplication(data as ApplicationRecord);
      setFeedbackMessage("Lamaran berhasil diperbarui.");
      closeForm();
    } catch (error) {
      console.error(error);
      setFeedbackMessage("Terjadi kesalahan saat memperbarui data.");
    }
  };

  const handleSubmit = async (payload: ApplicationPayload) => {
    if (formMode === "create") {
      await createApplication(payload);
    } else {
      await updateApplication(payload);
    }
  };

  const deleteApplication = async (application: ApplicationRecord) => {
    const confirmed = window.confirm(`Hapus lamaran untuk ${application.company}?`);
    if (!confirmed) return;

    if (isUsingDummyData) {
      setApplications((prev) => prev.filter((item) => item.id !== application.id));
      setFeedbackMessage("Data contoh telah dihapus secara lokal.");
      return;
    }

    if (!currentUser) {
      setFeedbackMessage("Session tidak ditemukan. Silakan login ulang.");
      return;
    }

    try {
      const { error } = await supabase
        .from("applications")
        .delete()
        .eq("id", application.id)
        .eq("user_id", currentUser.id);

      if (error) {
        throw error;
      }

      setApplications((prev) => prev.filter((item) => item.id !== application.id));
      setFeedbackMessage("Lamaran berhasil dihapus.");
    } catch (error) {
      console.error(error);
      setFeedbackMessage("Gagal menghapus data.");
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      router.replace("/");
    } catch (error) {
      console.error(error);
      setFeedbackMessage("Gagal logout. Silakan coba lagi.");
    }
  };

  return (
    <Box bg="gray.900" minH="100vh" py={10}>
      <Container maxW="6xl">
        <Flex
          direction={{ base: "column", md: "row" }}
          align={{ base: "flex-start", md: "center" }}
          justify="space-between"
          gap={6}
          mb={10}
        >
          <Box>
            <Heading size="lg" color="white">
              {currentUser ? `Hi, ${currentUser.email ?? "there"}` : "JobTrackr Dashboard"}
            </Heading>
            <Text mt={2} color="gray.300">
              Pantau status lamaran kerja Anda dan kelola semuanya dalam satu tempat.
            </Text>
            {feedbackMessage && (
              <Alert mt={4} status="info" bg="blue.800" color="white" borderRadius="md">
                <AlertIcon />
                <AlertDescription>{feedbackMessage}</AlertDescription>
              </Alert>
            )}
          </Box>
          <ButtonGroup spacing={3} flexShrink={0} display="flex" flexDirection={{ base: "column", md: "row" }}>
            <ExportToExcel applications={filteredApplications} />
            <Button colorScheme="blue" onClick={openCreateForm}>
              Add Application
            </Button>
            <Button variant="outline" colorScheme="gray" onClick={handleLogout}>
              Logout
            </Button>
          </ButtonGroup>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={8}>
          <SummaryCard title="Total Applications" value={summary.total} accent="blue.400" />
          <SummaryCard title="Total Interview" value={summary.interview} accent="yellow.400" />
          <SummaryCard title="Total Rejected" value={summary.rejected} accent="red.400" />
          <SummaryCard title="Total Hired" value={summary.hired} accent="green.400" />
        </SimpleGrid>

        <Box borderWidth="1px" borderColor="gray.700" bg="gray.800" rounded="lg" p={6} shadow="lg" mb={8}>
          <Flex direction={{ base: "column", lg: "row" }} align={{ lg: "center" }} justify="space-between" gap={4}>
            <Heading size="md" color="gray.100">
              Filter Status
            </Heading>
            <StatusFilter activeStatus={statusFilter} onChange={handleFilterChange} />
          </Flex>
        </Box>

        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6} mb={10}>
          <GridItem>
            {isLoading ? (
              <Box
                borderWidth="1px"
                borderColor="gray.700"
                bg="gray.800"
                rounded="lg"
                p={10}
                textAlign="center"
              >
                <Spinner size="lg" color="blue.400" />
                <Text mt={4} color="gray.300">
                  Memuat data lamaran...
                </Text>
              </Box>
            ) : (
              <ApplicationTable
                applications={filteredApplications}
                onEdit={openEditForm}
                onDelete={deleteApplication}
              />
            )}
          </GridItem>
          <GridItem>
            <StatusChart applications={applications} />
          </GridItem>
        </Grid>
      </Container>

      <Modal isOpen={isFormOpen} onClose={closeForm} size="lg" isCentered>
        <ModalOverlay bg="blackAlpha.700" />
        <ModalContent bg="gray.900" borderColor="gray.700" borderWidth="1px">
          <ModalHeader color="white">
            {formMode === "create" ? "Add New Application" : "Edit Application"}
          </ModalHeader>
          <ModalCloseButton color="gray.300" />
          <ModalBody pb={6}>
            <ApplicationForm
              mode={formMode}
              initialData={selectedApplication ?? undefined}
              onSubmit={handleSubmit}
              onCancel={closeForm}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

interface SummaryCardProps {
  title: string;
  value: number;
  accent: string;
}

function SummaryCard({ title, value, accent }: SummaryCardProps) {
  return (
    <Box borderWidth="1px" borderColor="gray.700" bg="gray.800" rounded="lg" p={5} shadow="lg">
      <Text fontSize="sm" fontWeight="medium" color="gray.300">
        {title}
      </Text>
      <Flex mt={3} align="center" justify="space-between">
        <Heading size="lg" color="white">
          {value}
        </Heading>
        <Box w="12" h="2" rounded="full" bg={accent} />
      </Flex>
    </Box>
  );
}
