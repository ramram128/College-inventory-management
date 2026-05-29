import {
    addEquipmentDoc,
    addFacilityDoc,
    addBookingDoc,
    addUserDoc,
    clearAllCollections,
} from "./firestoreService";
import { db } from "../../firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";
import type { Equipment, Facility, Booking, AppUser, ResearchProject } from "../context/AppContext";

const labData: Record<string, any> = {
    CHEMISTRY_LAB: {
        id: "f1",
        facilityName: "Advanced Chemistry Laboratory",
        roomLocation: "Block A - 101",
        spaceDescription: "Leading facility for chemical analysis, organic synthesis, and material characterization. Equipped with high-end spectroscopy and safety systems.",
        image: "https://images.unsplash.com/photo-1707944746058-4da338d0f827?w=800&q=80",
        categories: {
            "Analytical Instruments": ["UV-Visible Spectrophotometer", "FTIR Spectrometer", "Gas Chromatography (GC)", "High Performance Liquid Chromatography (HPLC)", "Atomic Absorption Spectrometer"],
            "Material Characterization": ["X-Ray Diffraction (XRD)", "Thermal Gravimetric Analyzer (TGA)", "Differential Scanning Calorimeter (DSC)", "Particle Size Analyzer", "Surface Area Analyzer"],
            "General Lab Equipment": ["Digital pH Meter", "Magnetic Stirrer", "Hot Air Oven", "Muffle Furnace", "Vacuum Pump"],
            "Organic Synthesis Equipment": ["Rotary Evaporator", "Soxhlet Extraction Apparatus", "Vacuum Distillation Unit", "Heating Mantle", "Nitrogen Gas Setup"],
            "Safety & Environmental Equipment": ["Fume Hood", "Eye Wash Station", "Chemical Spill Kit", "Gas Leak Detector", "Laminar Air Flow Unit"]
        }
    },
    BIOMEDICAL_LAB: {
        id: "f2",
        facilityName: "Biomedical Instrumentation & Research Lab",
        roomLocation: "Block B - 205",
        spaceDescription: "State-of-the-art lab focusing on biosignal processing, medical imaging, and rehabilitation technology.",
        image: "https://images.unsplash.com/photo-1732400333616-8efa4f385a03?w=800&q=80",
        categories: {
            "Imaging Systems": ["Ultrasound Scanner", "MRI Simulation Unit", "Optical Microscope", "Digital X-ray System", "Confocal Microscope"],
            "Diagnostic Equipment": ["ECG Machine", "EMG Machine", "Pulse Oximeter", "Blood Pressure Monitor", "Glucose Analyzer"],
            "Bio-Signal Processing": ["EEG Machine", "Data Acquisition System", "Patient Monitoring System", "Bio-Amplifier System", "Biomedical Signal Recorder"],
            "Laboratory Analysis Equipment": ["Centrifuge Machine", "Hematology Analyzer", "Biochemistry Analyzer", "ELISA Reader", "Incubator"],
            "Rehabilitation & Therapeutic Devices": ["TENS Therapy Unit", "Medical Ventilator", "Physiotherapy Ultrasound Unit", "Digital Spirometer", "Infusion Pump"]
        }
    },
    EEE_LAB: {
        id: "f3",
        facilityName: "Electrical Engineering & Power Systems Lab",
        roomLocation: "Block C - 110",
        spaceDescription: "A comprehensive laboratory for power systems testing, electrical machines, and high-voltage engineering research.",
        image: "https://images.unsplash.com/photo-1765830403209-a5eceac4c198?w=800&q=80",
        categories: {
            "Power Systems": ["Transformer Testing Kit", "Three Phase Induction Motor", "Load Bank Setup", "Auto Transformer", "Power Analyzer"],
            "Electrical Machines": ["DC Motor Test Setup", "Alternator Setup", "Motor Generator Set", "Speed Control Unit", "Synchronous Motor"],
            "Measurement Instruments": ["Digital Power Meter", "LCR Meter", "Oscilloscope", "Function Generator", "Clamp Meter"],
            "Renewable Energy Systems": ["Solar Panel Trainer Kit", "Wind Energy Demo Kit", "Solar Inverter System", "MPPT Controller", "Battery Storage System"],
            "High Voltage Engineering": ["High Voltage DC Test Kit", "Insulation Resistance Tester", "Lightning Surge Generator", "Breakdown Voltage Apparatus", "Earthing Resistance Tester"]
        }
    },
    ECE_LAB: {
        id: "f4",
        facilityName: "Electronics & Communication Systems Lab",
        roomLocation: "Block C - 215",
        spaceDescription: "Specialized lab for RF communications, embedded systems, VLSI design, and IoT development.",
        image: "https://images.unsplash.com/photo-1759866042499-d0b3e9d87ceb?w=800&q=80",
        categories: {
            "Communication Systems": ["RF Signal Generator", "Spectrum Analyzer", "Antenna Trainer Kit", "Optical Fiber Trainer Kit", "Microwave Test Bench"],
            "Embedded Systems": ["Arduino Development Board", "Raspberry Pi Kit", "FPGA Development Board", "ARM Cortex Board", "Microcontroller Trainer Kit"],
            "VLSI & Digital Systems": ["Logic Analyzer", "PCB Fabrication Unit", "Digital IC Trainer Kit", "Oscilloscope", "Soldering Station"],
            "Signal Processing Systems": ["DSP Processor Kit", "Audio Signal Analyzer", "Digital Filter Trainer Kit", "Waveform Analyzer", "Image Processing Workstation"],
            "IoT & Wireless Systems": ["IoT Development Kit", "GSM/GPRS Module", "LoRa Module", "Zigbee Module", "Smart Sensor Kit"]
        }
    },
    PHYSICS_LAB: {
        id: "f5",
        facilityName: "Precision Physics & Nuclear Research Lab",
        roomLocation: "Block D - 101",
        spaceDescription: "Advanced laboratory for optics, mechanics, electronics physics, and thermal studies.",
        image: "https://images.unsplash.com/photo-1707944746058-4da338d0f827?w=800&q=80",
        categories: {
            "Optics": ["Laser Source Kit", "Spectrometer", "Polarimeter", "Optical Bench", "Interference Apparatus"],
            "Mechanics": ["Young’s Modulus Apparatus", "Flywheel Setup", "Vibration Table", "Torsion Pendulum", "Spring Constant Setup"],
            "Electronics Physics": ["Hall Effect Setup", "CRO", "Semiconductor Diode Kit", "Transistor Characteristics Kit", "Photoelectric Effect Apparatus"],
            "Nuclear Physics Equipment": ["Geiger Muller Counter", "Radiation Detector", "Gamma Ray Spectrometer", "NMR Simulator", "Radioactive Demonstration Kit"],
            "Thermal Physics Equipment": ["Thermal Conductivity Apparatus", "Heat Engine Model", "Thermocouple Calibration Unit", "Specific Heat Setup", "Refrigeration Test Rig"]
        }
    },
    COMPUTER_LAB: {
        id: "f6",
        facilityName: "Computing, AI & Cyber Security Laboratory",
        roomLocation: "Block E - 505",
        spaceDescription: "High-performance computing facility for AI research, cybersecurity testing, and cloud infrastructure studies.",
        image: "https://images.unsplash.com/photo-1765830403209-a5eceac4c198?w=800&q=80",
        categories: {
            "Hardware Systems": ["High Performance Workstation", "GPU Computing System", "Server Rack Unit", "NAS Storage Device", "Networking Switch"],
            "Networking Equipment": ["Router", "Firewall Device", "Wireless Access Point", "Patch Panel", "Network Analyzer"],
            "Software & AI Systems": ["AI Workstation", "Database Server", "DevOps Server", "Cloud VM Setup", "Cyber Security Testing System"],
            "Cyber Security Systems": ["Penetration Testing System", "SIEM Server", "Malware Analysis Lab System", "Firewall Training Setup", "Network Sniffer System"],
            "Cloud & Data Center Systems": ["Virtualization Server", "Kubernetes Cluster Node", "Storage Area Network (SAN)", "Backup & Disaster Recovery Server", "Load Balancer Unit"]
        }
    },
    MECHANICAL_LAB: {
        id: "f7",
        facilityName: "Mechanical Engineering Laboratory",
        roomLocation: "Block M - 105",
        spaceDescription: "Equipped for advanced research in thermodynamics, heat transfer, robotics, and manufacturing excellence.",
        image: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=800&q=80",
        categories: {
            "Thermodynamics": ["Internal Combustion Engine Test Rig", "Steam Turbine Model", "Heat Exchanger Apparatus", "Refrigeration Cycle Trainer", "Heat Transfer Lab Setup", "Gas Turbine Model", "Combustion Analysis System"],
            "Fluid Mechanics": ["Bernoulli's Theorem Apparatus", "Centrifugal Pump Test Rig", "Pelton Wheel Turbine", "Venturi Meter", "Orifice Meter", "Impact of Jet Apparatus", "Pipe Friction Apparatus", "Hydraulic Bench"],
            "Robotics": ["6-Axis Industrial Robotic Arm", "Mobile Research Platform", "Automated Guided Vehicle (AGV)", "Haptic Interface", "SCARA Robot", "Vision-Guided Sorting System", "Collaborative Robot (Cobot)", "Pneumatic/Hydraulic Trainer"],
            "Material Testing": ["Universal Testing Machine (UTM)", "Hardness Tester", "Impact Testing Machine", "Fatigue Testing Rig", "Brinell Hardness Tester", "Charpy/Izod Impact Tester", "Creep Testing Machine", "Metallurgical Microscope"],
            "Manufacturing": ["CNC Milling Machine", "3D Metal Printer", "Laser Cutting System", "Coordinate Measuring Machine (CMM)", "Injection Molding Machine", "EDM Machine (Spark Erosion)", "Surface Grinder", "Precision Lathe"]
        }
    }
};

const seedBookings: Booking[] = [
    { id: "RD-1001", name: "Dr. Sarah Chen", email: "s.chen@mit.edu", department: "Chemistry Dept., MIT", type: "equipment", facility: "Advanced Chemistry Laboratory", equipment: "UV-Visible Spectrophotometer", date: "2026-03-10", timeSlot: "10:00 - 12:00", purpose: "Analysis of metabolite compounds in biological samples for cancer research.", status: "Pending", submittedAt: "2026-03-01T09:15:00Z" },
    { id: "RD-1002", name: "Prof. James Wright", email: "j.wright@stanford.edu", department: "Materials Science, Stanford", type: "facility", facility: "Clean Room Facility", equipment: "", date: "2026-03-12", timeSlot: "08:00 - 10:00", purpose: "Nanofabrication of thin-film solar cell prototypes for renewable energy study.", status: "Approved", submittedAt: "2026-02-28T14:30:00Z" },
    { id: "RD-1003", name: "Dr. Alex Rivier", email: "a.rivier@technion.ac.il", department: "Mechanical Engineering", type: "equipment", facility: "Mechanical Engineering Laboratory", equipment: "6-Axis Industrial Robotic Arm", date: "2026-03-15", timeSlot: "14:00 - 16:00", purpose: "Kinematic analysis and programming of collaborative robotic movements.", status: "Approved", submittedAt: "2026-03-05T11:20:00Z" },
];

const seedUsers: AppUser[] = [
    { id: "2", firstName: "James", lastName: "Wright", email: "j.wright@stanford.edu", department: "Materials Science", institution: "Stanford University", role: "Professor", phone: "+1-650-555-0202", idProof: "STAN-EMP-0092", status: "Active", joinedAt: "2025-10-01" },
];

const seedResearchProjects: ResearchProject[] = [
    {
        id: "PROJ-1",
        year: "2024",
        title: "Smart Energy Management System Using IoT",
        description: "This project presents an IoT-based smart energy management system that monitors and controls energy consumption in real-time. The system helps in reducing energy wastage and optimizing the usage through data analytics and automated control.",
        tags: [
            { name: "IoT", iconName: "Cpu" },
            { name: "Energy", iconName: "Zap" },
            { name: "Automation", iconName: "Settings" },
        ],
        duration: "3:45",
        videoUrl: "https://drive.google.com/file/d/1Xy_zVv0Xy_zVv0Xy_zVv0/view",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400",
        createdAt: new Date().toISOString()
    },
    {
        id: "PROJ-2",
        year: "2024",
        title: "AI-Based Fault Detection in Industrial Machines",
        description: "An AI-powered system that detects faults in industrial machines using vibration and temperature data. The model predicts potential failures and helps in preventive maintenance, reducing downtime and maintenance cost.",
        tags: [
            { name: "Artificial Intelligence", iconName: "Activity" },
            { name: "Machine Learning", iconName: "LayoutGrid" },
            { name: "Predictive Maintenance", iconName: "Settings" },
        ],
        duration: "4:12",
        videoUrl: "https://drive.google.com/file/d/1Xy_zVv0Xy_zVv0Xy_zVv0/view",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400",
        createdAt: new Date().toISOString()
    },
    {
        id: "PROJ-3",
        year: "2023",
        title: "Design and Analysis of Electric Vehicle Chassis",
        description: "This project focuses on the design, simulation, and structural analysis of a lightweight electric vehicle chassis to improve strength, safety, and performance while reducing overall weight.",
        tags: [
            { name: "Electric Vehicle", iconName: "Car" },
            { name: "CAD/CAE", iconName: "LayoutGrid" },
            { name: "Simulation", iconName: "Activity" },
        ],
        duration: "5:08",
        videoUrl: "https://drive.google.com/file/d/1Xy_zVv0Xy_zVv0Xy_zVv0/view",
        image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=400",
        createdAt: new Date().toISOString()
    }
];

export async function ensureDefaultData(): Promise<void> {
    console.log("Syncing default laboratory and equipment data...");
    try {
        for (const [catId, data] of Object.entries(labData)) {
            // 1. Ensure Facility exists
            const facRef = doc(db, "facilities", data.id);
            const facSnap = await getDoc(facRef);

            const facData: Facility = {
                id: data.id,
                facilityName: data.facilityName,
                facilityCategory: catId,
                availabilityStatus: facSnap.exists() ? facSnap.data().availabilityStatus : "Available",
                capacity: 25,
                roomLocation: data.roomLocation,
                spaceDescription: data.spaceDescription,
                keyFacilityFeatures: Object.keys(data.categories),
                createdAt: facSnap.exists() ? facSnap.data().createdAt : new Date().toISOString(),
                image: data.image
            };
            await setDoc(facRef, facData, { merge: true });

            // 2. Ensure Categories and Equipment exist
            for (const [eqCatName, eqNames] of Object.entries(data.categories)) {
                // Ensure category name doc exists
                await setDoc(doc(db, "facilityCategories", catId, "equipmentCategories", eqCatName), { name: eqCatName }, { merge: true });

                for (const [index, name] of (eqNames as string[]).entries()) {
                    const eqId = `e_${data.id}_${index}`; // Deterministic ID for syncing
                    const eqRef = doc(db, "facilities", data.id, "equipment", eqId);

                    await setDoc(eqRef, {
                        id: eqId,
                        equipmentName: name,
                        equipmentCategory: eqCatName,
                        initialStatus: "Available",
                        manufacturer: "Premium Laboratory Supplier",
                        modelNumber: `RD-${1000 + index}`,
                        instrumentDescription: `High-precision ${name} designed for advanced research and developmental applications in ${data.facilityName}.`,
                        technicalSpecifications: ["Unit calibrated to ISO 9001 standards", "Automated precision control", "Real-time data logging enabled"],
                        researchApplications: ["Advanced Academic Research", "Industrial Prototype Development", "Scientific Analysis"],
                        facilityId: data.id
                    }, { merge: true });
                }
            }
        }

        // 3. Ensure Research Projects exist
        for (const proj of seedResearchProjects) {
            const projRef = doc(db, "researchProjects", proj.id);
            const projSnap = await getDoc(projRef);
            if (!projSnap.exists()) {
                await setDoc(projRef, proj);
            }
        }

        console.log("✅ Data synchronization complete!");
    } catch (error) {
        console.error("❌ Sync failed:", error);
        throw error;
    }
}

export async function seedAllCollections(): Promise<void> {
    console.log("🔥 Clearing and Seeding Firestore with Comprehensive Lab Data...");

    try {
        await clearAllCollections();
        console.log("✅ Cleared all collections");

        // Just call ensureDefaultData after clearing for the full reset
        await ensureDefaultData();

        console.log("  → Seeding bookings...");
        for (const bk of seedBookings) await addBookingDoc(bk);

        console.log("  → Seeding users...");
        for (const usr of seedUsers) await addUserDoc(usr);

        console.log("  → Seeding research projects...");
        for (const proj of seedResearchProjects) {
            await setDoc(doc(db, "researchProjects", proj.id), proj);
        }

        console.log("✅ Firestore full reset complete!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        throw error;
    }
}
