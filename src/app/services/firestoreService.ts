import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    query,
    orderBy,
    collectionGroup,
    writeBatch
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase";
import type { Equipment, Facility, Booking, AppUser, ResearchProject } from "../context/AppContext";

// ── Mappers ──────────────────────────────────────────────────────────────────
export function mapFacility(id: string, data: any): Facility {
    // Robustly parse capacity (handles "10 researchers" string or number)
    const rawCapacity = data.capacity || 0;
    const capacityNum = typeof rawCapacity === 'string'
        ? (parseInt(rawCapacity.replace(/\D/g, '')) || 0)
        : (Number(rawCapacity) || 0);

    return {
        id,
        facilityName: data.facilityName || data.name || "Unnamed Facility",
        facilityCategory: data.facilityCategory || data.category || "Other",
        availabilityStatus: data.availabilityStatus || data.availability || data.status || "Available",
        capacity: capacityNum,
        roomLocation: data.roomLocation || data.location || "Unknown Location",
        spaceDescription: data.spaceDescription || data.description || "",
        keyFacilityFeatures: Array.isArray(data.keyFacilityFeatures) ? data.keyFacilityFeatures :
            (Array.isArray(data.features) ? data.features : []),
        createdAt: data.createdAt || new Date().toISOString(),
        image: data.image || ""
    };
}

export function mapEquipment(id: string, data: any): Equipment {
    return {
        id,
        equipmentName: data.equipmentName || data.name || "Unnamed Equipment",
        equipmentCategory: data.equipmentCategory || data.category || "Other",
        initialStatus: data.initialStatus || data.status || "Available",
        manufacturer: data.manufacturer || "Unknown",
        modelNumber: data.modelNumber || "N/A",
        instrumentDescription: data.instrumentDescription || data.description || "",
        technicalSpecifications: Array.isArray(data.technicalSpecifications) ? data.technicalSpecifications :
            (Array.isArray(data.specifications) ? data.specifications : []),
        researchApplications: Array.isArray(data.researchApplications) ? data.researchApplications :
            (Array.isArray(data.applications) ? data.applications : []),
        facilityId: data.facilityId || ""
    };
}

// ── Equipment ────────────────────────────────────────────────────────────────

export async function getEquipment(): Promise<Equipment[]> {
    const snap = await getDocs(collectionGroup(db, "equipment"));
    return snap.docs.map((d) => mapEquipment(d.id, d.data()));
}

export async function addEquipmentDoc(facilityId: string, eq: Equipment): Promise<void> {
    await setDoc(doc(db, "facilities", facilityId, "equipment", eq.id), eq);
}

export async function updateEquipmentDoc(facilityId: string, id: string, updates: Partial<Equipment>): Promise<void> {
    await updateDoc(doc(db, "facilities", facilityId, "equipment", id), updates as Record<string, unknown>);
}

export async function deleteEquipmentDoc(facilityId: string, id: string): Promise<void> {
    await deleteDoc(doc(db, "facilities", facilityId, "equipment", id));
}

// ── Facilities ───────────────────────────────────────────────────────────────

export async function getFacilities(): Promise<Facility[]> {
    const snap = await getDocs(collection(db, "facilities"));
    return snap.docs.map((d) => mapFacility(d.id, d.data()));
}

export async function addFacilityDoc(fac: Facility): Promise<void> {
    try {
        await setDoc(doc(db, "facilities", fac.id), fac);
    } catch (err) {
        window.alert("Firestore Error: Could not save facility data.");
        throw err;
    }
}

export async function updateFacilityDoc(id: string, updates: Partial<Facility>): Promise<void> {
    try {
        await updateDoc(doc(db, "facilities", id), updates as Record<string, unknown>);
    } catch (err) {
        window.alert("Firestore Error: Could not update facility.");
        throw err;
    }
}

export async function deleteFacilityDoc(id: string): Promise<void> {
    try {
        await deleteDoc(doc(db, "facilities", id));
    } catch (err) {
        window.alert("Firestore Error: Could not delete facility.");
        throw err;
    }
}

// ── Bookings ─────────────────────────────────────────────────────────────────

export async function getBookings(): Promise<Booking[]> {
    const snap = await getDocs(collection(db, "bookings"));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Booking));
}

export async function addBookingDoc(booking: Booking): Promise<void> {
    await setDoc(doc(db, "bookings", booking.id), booking);
}

export async function updateBookingDoc(id: string, updates: Partial<Booking>): Promise<void> {
    await updateDoc(doc(db, "bookings", id), updates as Record<string, unknown>);
}

// ── Research Projects ────────────────────────────────────────────────────────

export async function addResearchProjectDoc(project: ResearchProject): Promise<void> {
    await setDoc(doc(db, "researchProjects", project.id), project);
}

export async function updateResearchProjectDoc(id: string, updates: Partial<ResearchProject>): Promise<void> {
    await updateDoc(doc(db, "researchProjects", id), updates as Record<string, unknown>);
}

export async function deleteResearchProjectDoc(id: string): Promise<void> {
    await deleteDoc(doc(db, "researchProjects", id));
}

// ── Users ────────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<AppUser[]> {
    const snap = await getDocs(collection(db, "users"));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as AppUser));
}

export async function addUserDoc(user: AppUser): Promise<void> {
    await setDoc(doc(db, "users", user.id), user);
}

export async function updateUserDoc(id: string, updates: Partial<AppUser>): Promise<void> {
    await updateDoc(doc(db, "users", id), updates as Record<string, unknown>);
}

export async function updateUserStatusDoc(id: string, status: AppUser["status"]): Promise<void> {
    await updateDoc(doc(db, "users", id), { status });
}
// ── Categories ───────────────────────────────────────────────────────────────

export async function getEquipmentCategories(facilityCategoryId: string): Promise<string[]> {
    const snap = await getDocs(collection(db, "facilityCategories", facilityCategoryId, "equipmentCategories"));
    return snap.docs.map(d => d.data().name as string).filter(Boolean);
}

export async function batchUpdateEquipment(facilityId: string, equipments: { id?: string, data: Equipment }[]): Promise<void> {
    const batch = writeBatch(db);
    equipments.forEach(({ id, data }) => {
        const docRef = id
            ? doc(db, "facilities", facilityId, "equipment", id)
            : doc(collection(db, "facilities", facilityId, "equipment"));
        batch.set(docRef, data);
    });
    await batch.commit();
}

// ── Cleanup ──────────────────────────────────────────────────────────────────

export async function clearAllCollections(): Promise<void> {
    const collections = ["facilities", "bookings", "users"];

    // 1. Delete top-level collections
    for (const colName of collections) {
        const snap = await getDocs(collection(db, colName));
        const batch = writeBatch(db);
        snap.forEach(d => batch.delete(d.ref));
        await batch.commit();
    }

    // 2. Delete equipment (subcollection via collectionGroup)
    const eqSnap = await getDocs(collectionGroup(db, "equipment"));
    const eqBatch = writeBatch(db);
    eqSnap.forEach(d => eqBatch.delete(d.ref));
    await eqBatch.commit();

    // 3. Delete facilityCategories (nested)
    const catSnap = await getDocs(collection(db, "facilityCategories"));
    for (const catDoc of catSnap.docs) {
        const subSnap = await getDocs(collection(db, "facilityCategories", catDoc.id, "equipmentCategories"));
        const subBatch = writeBatch(db);
        subSnap.forEach(d => subBatch.delete(d.ref));
        await subBatch.commit();

        await deleteDoc(catDoc.ref);
    }
}

// ── Storage ──────────────────────────────────────────────────────────────────

export async function uploadFacilityImage(
    facilityId: string,
    file: File | Blob,
    onProgress?: (transferred: number, total: number) => void
): Promise<string> {
    try {
        const cleanName = (file as any).name?.replace(/[^a-zA-Z0-9.]/g, '_') || `image_${Date.now()}.jpg`;
        const storagePath = `facility_images/${facilityId}/${Date.now()}_${cleanName}`;
        const storageRef = ref(storage, storagePath);

        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                (snapshot: any) => {
                    if (onProgress) onProgress(snapshot.bytesTransferred, snapshot.totalBytes);
                },
                (error: any) => {
                    console.error("Storage Error:", error);
                    window.alert(`Storage Error: ${error.message || "Failed to upload image."}`);
                    reject(error);
                },
                async () => {
                    const url = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(url);
                }
            );
        });
    } catch (err) {
        console.error("Storage Error:", err);
        throw err;
    }
}
