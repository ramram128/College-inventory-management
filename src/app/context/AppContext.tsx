import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  addEquipmentDoc,
  updateEquipmentDoc,
  deleteEquipmentDoc,
  addFacilityDoc,
  updateFacilityDoc,
  deleteFacilityDoc,
  addBookingDoc,
  updateBookingDoc,
  addUserDoc,
  updateUserDoc,
  updateUserStatusDoc,
  batchUpdateEquipment as fsBatchUpdateEquipment,
  mapEquipment,
  mapFacility,
  addResearchProjectDoc,
  updateResearchProjectDoc,
  deleteResearchProjectDoc,
} from "../services/firestoreService";
import { db, auth } from "../../firebase";
import { seedAllCollections } from "../services/seedFirestore";
import {
  collection,
  onSnapshot,
  collectionGroup,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from "firebase/auth";
import emailjs from '@emailjs/browser';

// ── Types ────────────────────────────────────────────────────────────────────

export interface Equipment {
  id: string; // Changed to string for Firestore consistency
  equipmentName: string;
  equipmentCategory: string;
  initialStatus: "Available" | "In Use" | "Maintenance";
  manufacturer: string;
  modelNumber: string;
  instrumentDescription: string;
  technicalSpecifications: string[];
  researchApplications: string[];
  facilityId: string; // Changed to string
}

export interface Facility {
  id: string; // Changed to string
  facilityName: string;
  facilityCategory: string;
  availabilityStatus: "Available" | "Limited" | "Unavailable";
  capacity: number;
  roomLocation: string;
  spaceDescription: string;
  keyFacilityFeatures: string[];
  createdAt: string;
  image?: string; // Kept for UI
}

export interface Booking {
  id: string;
  name: string;
  email: string;
  userId?: string;      // Firebase Auth UID for individual history tracking
  department: string;
  type: string;
  facility: string;
  equipment: string;
  date: string;
  timeSlot: string;
  purpose: string;
  status: "Pending" | "Approved" | "Rejected";
  submittedAt: string;
  persons?: number;
  quantity?: number;
}

export interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  institution: string;
  role: string;
  phone: string;
  status: "Active" | "Pending" | "Inactive";
  joinedAt: string;
  profilePic?: string;
  researchInterests?: string[];
  idProof?: string;
}

export interface ResearchProject {
  id: string;
  year: string;
  title: string;
  description: string;
  videoUrl: string;
  tags: { name: string; iconName: string }[];
  duration: string;
  image?: string;
  createdAt?: string;
}

export interface AuthUser {
  id: string | "admin";
  name: string;
  email: string;
  role: "admin" | "researcher";
  profilePic?: string;
  emailVerified: boolean;
}

// ── Initial Data ─────────────────────────────────────────────────────────────
// Hardcoded data removed to ensure 100% Firebase integration.

// ── Context Type ──────────────────────────────────────────────────────────────

interface AppContextType {
  // Auth
  currentUser: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUserProfile: (updates: {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    profilePic?: string;
    idProof?: string;
  }) => void;

  // Facilities
  facilities: Facility[];
  addFacility: (facility: Omit<Facility, "id">) => void;
  updateFacility: (id: string, updates: Partial<Omit<Facility, "id">>) => void;
  updateFacilityAvailability: (id: string, availabilityStatus: Facility["availabilityStatus"]) => void;
  deleteFacility: (id: string) => void;
  addFacilityWithEquipment: (facility: Omit<Facility, "id">, items: Omit<Equipment, "id">[]) => Promise<void>;

  // Equipment
  equipment: Equipment[];
  addEquipment: (facilityId: string, item: Omit<Equipment, "id">) => Promise<void>;
  updateEquipment: (facilityId: string, id: string, updates: Partial<Omit<Equipment, "id">>) => Promise<void>;
  updateEquipmentStatus: (facilityId: string, id: string, initialStatus: Equipment["initialStatus"]) => void;
  deleteEquipment: (facilityId: string, id: string) => void;
  updateEquipmentBatch: (facilityId: string, updates: { id?: string, data: Equipment }[]) => Promise<void>;

  // Bookings
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, "id" | "status" | "submittedAt">) => Promise<string>;
  updateBookingStatus: (id: string, status: Booking["status"]) => void;

  // Users
  users: AppUser[];
  registerUser: (user: Omit<AppUser, "id" | "status" | "joinedAt"> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  updateUserStatus: (id: string, status: AppUser["status"]) => void;

  // Research Projects
  researchProjects: ResearchProject[];
  addResearchProject: (project: Omit<ResearchProject, "id" | "createdAt">) => Promise<void>;
  updateResearchProject: (id: string, updates: Partial<Omit<ResearchProject, "id">>) => Promise<void>;
  deleteResearchProject: (id: string) => Promise<void>;

  // Seeding
  seedingStatus: string;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [researchProjects, setResearchProjects] = useState<ResearchProject[]>([]);
  const [seedingStatus, setSeedingStatus] = useState("");
  const [nextEquipId, setNextEquipId] = useState(1);
  const [nextFacilityId, setNextFacilityId] = useState(1);

  // ── Real-time Firestore listeners ────────────────────────────────────────
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    // 1. Facilities (real-time)
    unsubs.push(
      onSnapshot(collection(db, "facilities"), (snap) => {
        const fsFac = snap.docs.map(d => mapFacility(d.id, d.data()));
        setFacilities(fsFac);
        if (fsFac.length > 0) {
          setNextFacilityId(Math.max(...fsFac.map(f => parseInt(f.id) || 0)) + 1);
          setSeedingStatus(""); // Clear once loaded
        } else {
          // Auto-seed if database is empty (e.g., after manual delete or first run)
          setSeedingStatus("Loading sample data...");
          console.log("🌱 Labs list is empty. Auto-seeding sample data...");
          seedAllCollections()
            .then(() => setSeedingStatus("✅ Sample data loaded!"))
            .catch(err => {
              console.error("❌ Auto-seed failed:", err);
              setSeedingStatus("❌ Auto-load failed: Please check Firestore Rules.");
            });
        }
      }, (err) => console.warn("Facilities listener error:", err))
    );

    // 2. Equipment via collectionGroup (real-time)
    //    Falls back to per-facility subcollection queries if collectionGroup index is missing
    const equipUnsub = onSnapshot(
      collectionGroup(db, "equipment"),
      (snap) => {
        const fsEquip = snap.docs.map(d => mapEquipment(d.id, d.data()));
        setEquipment(fsEquip);
        if (fsEquip.length > 0)
          setNextEquipId(Math.max(...fsEquip.map(e => parseInt(e.id) || 0)) + 1);
      },
      async (err) => {
        // collectionGroup failed (likely missing Firestore index for guests).
        // Fall back: fetch equipment from each facility's subcollection directly.
        console.warn("Equipment collectionGroup failed, using per-facility fallback:", err.message);
        try {
          const facilitiesSnap = await import("firebase/firestore").then(({ getDocs, collection }) =>
            getDocs(collection(db, "facilities"))
          );
          const allEquip: Equipment[] = [];
          await Promise.all(
            facilitiesSnap.docs.map(async (fDoc) => {
              const { getDocs, collection } = await import("firebase/firestore");
              const eSnap = await getDocs(collection(db, "facilities", fDoc.id, "equipment"));
              eSnap.docs.forEach(d => allEquip.push(mapEquipment(d.id, d.data())));
            })
          );
          setEquipment(allEquip);
          if (allEquip.length > 0)
            setNextEquipId(Math.max(...allEquip.map(e => parseInt(e.id) || 0)) + 1);
        } catch (fallbackErr) {
          console.error("Equipment fallback fetch also failed:", fallbackErr);
        }
      }
    );
    unsubs.push(equipUnsub);

    // 3. Bookings (real-time) — admin sees new bookings instantly
    unsubs.push(
      onSnapshot(collection(db, "bookings"), (snap) => {
        const fsBook = snap.docs.map(d => ({ ...d.data(), id: d.id } as Booking));
        setBookings(fsBook);
        console.log("🔄 Bookings updated:", fsBook.length);
      }, (err) => console.warn("Bookings listener error:", err))
    );

    // 4. Users (real-time) — admin sees new registrations instantly
    unsubs.push(
      onSnapshot(collection(db, "users"), (snap) => {
        const fsUsr = snap.docs.map(d => ({ ...d.data(), id: d.id } as AppUser));
        setUsers(fsUsr);
        console.log("🔄 Users updated:", fsUsr.length);
      }, (err) => console.warn("Users listener error:", err))
    );

    // 5. Research Projects (real-time)
    unsubs.push(
      onSnapshot(collection(db, "researchProjects"), (snap) => {
        const fsProj = snap.docs.map(d => ({ ...d.data(), id: d.id } as ResearchProject));
        setResearchProjects(fsProj);
        console.log("🔄 Research Projects updated:", fsProj.length);
      }, (err) => console.warn("Research Projects listener error:", err))
    );

    return () => unsubs.forEach(u => u());
  }, []);

  // ── Auth Listener ──────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const isAdmin = fbUser.email === "clginventorymanagement@gmail.com";

        if (isAdmin) {
          setCurrentUser({ id: fbUser.uid, name: "Admin", email: fbUser.email!, role: "admin", emailVerified: true });
          return;
        }

        // Fetch user doc from Firestore directly (avoids race condition with React state)
        const userRef = doc(db, "users", fbUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data() as AppUser;
          setCurrentUser({
            id: data.id,
            name: `${data.firstName} ${data.lastName}`.trim() || data.email,
            email: data.email,
            role: "researcher",
            profilePic: data.profilePic,
            emailVerified: fbUser.emailVerified
          });
        } else {
          // Wait for the registerUser function to finish writing the real profile to Firestore
          const emailName = fbUser.email?.split('@')[0] || "user";
          setCurrentUser({ id: fbUser.uid, name: emailName, email: fbUser.email || "", role: "researcher", emailVerified: fbUser.emailVerified });
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);


  // Auth
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      return { success: true };
    } catch (error: any) {

      // Auto-Provisioning for Admin
      if (cleanEmail === "clginventorymanagement@gmail.com" && cleanPass === "password1234@mce") {
        try {
          // Attempt to create if login failed for any reason other than wrong password
          if (error.code !== 'auth/wrong-password') {
            const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
            const fbUser = userCredential.user;

            const adminUser: AppUser = {
              id: fbUser.uid,
              firstName: "Super",
              lastName: "Admin",
              email: cleanEmail,
              role: "admin",
              status: "Active",
              joinedAt: new Date().toISOString().split("T")[0],
              department: "Administration",
              institution: "MCE R&D Center",
              phone: "+1 (555) 000-0000"
            };

            setUsers(prev => [...prev, adminUser]);
            await addUserDoc(adminUser);
            return { success: true };
          }
        } catch (createError: any) {
          return { success: false, error: "Initial setup failed: " + (createError.code === 'auth/operation-not-allowed' ? "Email/Password auth is disabled in your Firebase Dashboard." : createError.message) };
        }
      }

      let message = "Invalid email or password.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        message = "Account not found. Please register first.";
      } else if (error.code === 'auth/wrong-password') {
        message = "Incorrect password. Please try again.";
      } else if (error.code === 'auth/too-many-requests') {
        message = "Too many failed attempts. Please try again later.";
      }
      return { success: false, error: message };
    }
  };

  const logout = () => signOut(auth);

  const updateUserProfile = (updates: { name?: string; email?: string; phone?: string; password?: string; profilePic?: string; idProof?: string; }) => {
    if (!currentUser) return;

    // Update currentUser state (only name, email, and profilePic are exposed to AuthUser)
    setCurrentUser(prev => prev ? {
      ...prev,
      ...(updates.name && { name: updates.name }),
      ...(updates.email && { email: updates.email }),
      ...(updates.profilePic !== undefined && { profilePic: updates.profilePic })
    } : null);

    // Synchronize with users list
    if (currentUser.id !== "admin") {
      setUsers(prev => prev.map(u => {
        if (u.id === currentUser.id) {
          const [firstName = "", ...lastNameParts] = (updates.name || `${u.firstName} ${u.lastName}`).split(" ");
          const lastName = lastNameParts.join(" ");
          return {
            ...u,
            firstName,
            lastName,
            email: updates.email || u.email,
            ...(updates.phone && { phone: updates.phone }),
            ...(updates.profilePic !== undefined && { profilePic: updates.profilePic }),
            ...(updates.idProof !== undefined && { idProof: updates.idProof })
          };
        }
        return u;
      }));

      // Sync to Firestore
      const userId = currentUser.id as string;
      const [firstName = "", ...lastNameParts] = (updates.name || "").split(" ");
      const firestoreUpdates: Record<string, unknown> = {};
      if (updates.name) { firestoreUpdates.firstName = firstName; firestoreUpdates.lastName = lastNameParts.join(" "); }
      if (updates.email) firestoreUpdates.email = updates.email;
      if (updates.phone) firestoreUpdates.phone = updates.phone;
      if (updates.profilePic !== undefined) firestoreUpdates.profilePic = updates.profilePic;
      if (updates.idProof !== undefined) firestoreUpdates.idProof = updates.idProof;
      if (Object.keys(firestoreUpdates).length > 0) {
        updateUserDoc(userId, firestoreUpdates as Partial<AppUser>).catch(console.error);
      }
    }
  };

  // Equipment (Note: Updated to use facilityId for Firestore subcollections)
  const addEquipment = async (facilityId: string, item: Omit<Equipment, "id">) => {
    const newItem = { ...item, id: String(nextEquipId), facilityId } as Equipment;
    setEquipment((prev) => [...prev, newItem]);
    setNextEquipId((n) => n + 1);
    await addEquipmentDoc(facilityId, newItem);
  };
  const updateEquipment = async (facilityId: string, id: string, updates: Partial<Omit<Equipment, "id">>) => {
    setEquipment((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    await updateEquipmentDoc(facilityId, id, updates as Partial<Equipment>);
  };
  const updateEquipmentStatus = (facilityId: string, id: string, initialStatus: Equipment["initialStatus"]) => {
    setEquipment((prev) => prev.map((e) => (e.id === id ? { ...e, initialStatus } : e)));
    updateEquipmentDoc(facilityId, id, { initialStatus }).catch(console.error);
  };
  const deleteEquipment = (facilityId: string, id: string) => {
    setEquipment((prev) => prev.filter((e) => e.id !== id));
    deleteEquipmentDoc(facilityId, id).catch(console.error);
  };

  const updateEquipmentBatch = async (facilityId: string, updates: { id?: string, data: Equipment }[]) => {
    // Update local state first
    setEquipment(prev => {
      let current = [...prev];
      updates.forEach(({ id, data }) => {
        if (id) {
          current = current.map(e => e.id === id ? data : e);
        } else {
          current.push(data);
        }
      });
      return current;
    });
    // Then sync with Firestore
    await fsBatchUpdateEquipment(facilityId, updates);
  };

  // Facilities
  const addFacility = async (facility: Omit<Facility, "id">) => {
    const newFac = { ...facility, id: String(nextFacilityId) } as Facility;
    setFacilities((prev) => [...prev, newFac]);
    setNextFacilityId((n) => n + 1);
    await addFacilityDoc(newFac);
  };

  const addFacilityWithEquipment = async (facility: Omit<Facility, "id">, items: Omit<Equipment, "id">[]) => {
    const fId = String(nextFacilityId);
    const newFac = { ...facility, id: fId } as Facility;
    setFacilities((prev) => [...prev, newFac]);
    setNextFacilityId((n) => n + 1);
    await addFacilityDoc(newFac);

    const newEquipments = items.map((item, index) => ({
      ...item,
      id: String(nextEquipId + index),
      facilityId: fId
    } as Equipment));
    setEquipment((prev) => [...prev, ...newEquipments]);
    setNextEquipId((n) => n + items.length);
    for (const eq of newEquipments) {
      await addEquipmentDoc(fId, eq);
    }
  };
  const updateFacility = async (id: string, updates: Partial<Omit<Facility, "id">>) => {
    setFacilities((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    await updateFacilityDoc(id, updates as Partial<Facility>);
  };
  const updateFacilityAvailability = (id: string, availabilityStatus: Facility["availabilityStatus"]) => {
    setFacilities((prev) => prev.map((f) => (f.id === id ? { ...f, availabilityStatus } : f)));
    updateFacilityDoc(id, { availabilityStatus }).catch(console.error);
  };
  const deleteFacility = (id: string) => {
    setFacilities((prev) => prev.filter((f) => f.id !== id));
    deleteFacilityDoc(id).catch(console.error);
  };

  // Bookings
  const addBooking = async (booking: Omit<Booking, "id" | "status" | "submittedAt">): Promise<string> => {
    const id = `RD-${Date.now()}`;
    const submittedAt = new Date().toISOString();
    const newBooking = { ...booking, id, status: "Pending" as const, submittedAt };

    // Create sanitized payload (Firestore rejects literal undefined)
    const firestorePayload: any = { ...newBooking };
    if (firestorePayload.persons === undefined) delete firestorePayload.persons;
    if (firestorePayload.quantity === undefined) delete firestorePayload.quantity;
    if (firestorePayload.userId === undefined) delete firestorePayload.userId;

    // Update local state first for immediate feedback
    setBookings((prev) => [...prev, newBooking]);

    // 1. Save to top-level bookings collection
    try {
      await addBookingDoc(firestorePayload);

      // 2. Also save to user's personal subcollection
      if (booking.userId) {
        await setDoc(doc(db, "users", booking.userId, "bookings", id), firestorePayload);
      }

      // 3. Send Email Notifications
      try {
        const resourceName = booking.type === "facility" ? booking.facility : booking.equipment;
        
        // Notify User
        const userMessage = `We have successfully received your booking request through the EWB Portal.\n\n🔹 Booking Summary\n• Resource: ${resourceName}\n• Requested Date: ${booking.date}\n• Time Duration: ${booking.timeSlot}\n\nYour request is currently pending admin approval. We will notify you once an action is taken.`;

        emailjs.send(
          "service_n16bnwf",
          "template_irtbf1c",
          {
            name: booking.name,
            email: booking.email,
            title: `Booking Request Received`,
            status: "Pending",
            message: userMessage,
            id: id
          },
          { publicKey: "FTAuSlj6ffIeU6e0l" }
        ).catch(err => console.error('Failed to send user confirmation email', err));

        // Notify Admin
        const adminMessage = `This is to inform you that a new equipment/facility booking request has been successfully submitted through the EWB Portal.\n\n🔹 User Information\n• Name: ${booking.name}\n• Email: ${booking.email}\n• Department: ${booking.department}\n\n🔹 Booking Summary\n• Equipment / Facility: ${resourceName}\n• Requested Date: ${booking.date}\n• Time Duration: ${booking.timeSlot}\n\n🔹 Additional Details\n• Purpose: ${booking.purpose}\n• Submitted On: ${new Date(newBooking.submittedAt).toLocaleString()}\n\nPlease review this request at your earliest convenience and take appropriate action (Approve/Reject) via the Admin Portal.`;

        emailjs.send(
          "service_n16bnwf",
          "template_irtbf1c",
          {
            name: "Admin",
            email: "clginventorymanagement@gmail.com",
            title: `New Booking Request`,
            status: "Action Required",
            message: adminMessage,
            id: id
          },
          { publicKey: "FTAuSlj6ffIeU6e0l" }
        ).catch(err => console.error('Failed to send admin notification email', err));
      } catch (err) {
        console.error("EmailJS Error during booking:", err);
      }

      return id;
    } catch (err) {
      console.error("❌ Error adding booking:", err);
      // Rollback local state on error
      setBookings((prev) => prev.filter(b => b.id !== id));
      throw err;
    }
  };
  const updateBookingStatus = (id: string, status: Booking["status"]) => {
    setBookings((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, status } : b));

      // Resource Status Automation and Email Notification
      if (status === "Approved" || status === "Rejected") {
        const booking = prev.find(b => b.id === id);
        if (booking) {
          // 1. Automate Facility Availability
          if (status === "Approved" && booking.facility) {
            const fac = facilities.find(f => f.facilityName === booking.facility);
            if (fac) {
              const persons = booking.persons || 1;
              const newStatus = persons >= fac.capacity ? "Unavailable" : "Limited";
              updateFacilityAvailability(fac.id, newStatus);
            }
          }
          // 2. Automate Equipment Status
          if (status === "Approved" && booking.equipment) {
            const eq = equipment.find(e => e.equipmentName === booking.equipment);
            if (eq) {
              // Maintenance is manual only, so we only automate "In Use"
              updateEquipmentStatus(eq.facilityId, eq.id, "In Use");
            }
          }

          // 3. Send Email via EmailJS
          try {
            const resourceName = booking.type === "facility" ? booking.facility : booking.equipment;
            const templateParams = {
              name: booking.name,
              email: booking.email,
              title: `${resourceName} Booking ${status}`,
              status: status,
              message: `Your booking request for ${resourceName} has been ${status.toLowerCase()}.`,
              id: booking.id
            };

            emailjs.send(
              "service_n16bnwf", // Service ID
              "template_db9vrw7", // Template ID
              templateParams,
              {
                publicKey: "FTAuSlj6ffIeU6e0l"
              }
            ).then((response) => {
              console.log('SUCCESS! Email sent.', response.status, response.text);
            }).catch((err) => {
              console.error('FAILED to send email...', err);
            });
          } catch (err) {
            console.error("EmailJS Error:", err);
          }
        }
      }

      return updated;
    });
    updateBookingDoc(id, { status }).catch(console.error);
  };

  // Users
  const registerUser = async (user: Omit<AppUser, "id" | "status" | "joinedAt"> & { password?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      if (user.email === "clginventorymanagement@gmail.com") return { success: false, error: "This email is reserved." };

      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password!);
      const fbUser = userCredential.user;

      // Send Verification Email
      await sendEmailVerification(fbUser);

      const today = new Date().toISOString().split("T")[0];
      const newUser: AppUser = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email,
        department: user.department || "",
        institution: user.institution || "",
        role: user.role || "",
        phone: user.phone || "",
        researchInterests: user.researchInterests || [],
        id: fbUser.uid,
        status: "Active", // Note: UI logic handles emailVerified check, but they are registered
        joinedAt: today
      };

      // Save to Firestore — surface any errors clearly
      try {
        await addUserDoc(newUser);
        console.log("✅ User saved to Firestore:", newUser.email, "| UID:", newUser.id);
      } catch (firestoreErr: any) {
        console.error("❌ Firestore write failed:", firestoreErr);
        // Auth account was created but Firestore failed — still let user in but warn
        setUsers((prev) => [...prev, newUser]);
        return { success: true, error: `Account created but profile could not be saved: ${firestoreErr.message}` };
      }

      setUsers((prev) => [...prev, newUser]);
      return { success: true };
    } catch (error: any) {
      let errorMessage = "An error occurred during registration.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Please sign in instead.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use at least 6 characters.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format.";
      } else {
        errorMessage = error.message || "Registration failed. Please try again.";
      }
      return { success: false, error: errorMessage };
    }
  };

  const updateUserStatus = (id: string, status: AppUser["status"]) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
    updateUserStatusDoc(id, status).catch(console.error);
  };

  // Research Projects
  const addResearchProject = async (project: Omit<ResearchProject, "id" | "createdAt">) => {
    const id = `PROJ-${Date.now()}`;
    const newProj: ResearchProject = { ...project, id, createdAt: new Date().toISOString() };
    setResearchProjects(prev => [...prev, newProj]);
    await addResearchProjectDoc(newProj);
  };

  const updateResearchProject = async (id: string, updates: Partial<Omit<ResearchProject, "id">>) => {
    setResearchProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    await updateResearchProjectDoc(id, updates as Partial<ResearchProject>);
  };

  const deleteResearchProject = async (id: string) => {
    setResearchProjects(prev => prev.filter(p => p.id !== id));
    await deleteResearchProjectDoc(id);
  };

  return (
    <AppContext.Provider value={{
      currentUser, login, logout, updateUserProfile,
      equipment, addEquipment, updateEquipment, updateEquipmentStatus, deleteEquipment,
      updateEquipmentBatch,
      facilities, addFacility, updateFacility, updateFacilityAvailability,
      deleteFacility,
      addFacilityWithEquipment,
      bookings, addBooking, updateBookingStatus,
      users, registerUser, updateUserStatus,
      researchProjects, addResearchProject, updateResearchProject, deleteResearchProject,
      seedingStatus
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppContextProvider");
  return ctx;
}
