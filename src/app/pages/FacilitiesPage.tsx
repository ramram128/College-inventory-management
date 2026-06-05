import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { LayoutGrid, FlaskConical, Dna, Zap, Cpu, Atom, ChevronRight, Package, Info, CheckCircle2, AlertCircle, ArrowLeft, PackageSearch, Users, Monitor, Microscope, Clock, Thermometer, Settings2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAppContext } from "../context/AppContext";

const allCategories = ["All", "CHEMISTRY_LAB", "BIOMEDICAL_LAB", "EEE_LAB", "ECE_LAB", "PHYSICS_LAB", "COMPUTER_LAB", "MECHANICAL_LAB"];

const categoryDisplayMap: Record<string, string> = {
  "All": "All Research Areas",
  "CHEMISTRY_LAB": "Chemistry Laboratory",
  "BIOMEDICAL_LAB": "Biomedical Laboratory",
  "EEE_LAB": "Electrical and Electronics Engineering Laboratory",
  "ECE_LAB": "Electronics and Communication Engineering Laboratory",
  "PHYSICS_LAB": "Physics Laboratory",
  "COMPUTER_LAB": "Computing Laboratory",
  "MECHANICAL_LAB": "Mechanical Engineering Laboratory"
};

export function FacilitiesPage() {
  const { facilities, equipment } = useAppContext();
  const location = useLocation();
  const rawData = location.state?.data;
  const passedData = (rawData === "all" || rawData === "All") ? null : rawData;

  const defaultCategory = passedData && allCategories.some(c => c.toLowerCase() === passedData.toLowerCase())
    ? allCategories.find(c => c.toLowerCase() === passedData.toLowerCase()) || "All"
    : "All";

  const [activeCategory, setActiveCategory] = useState(defaultCategory);
  const [selectedEquipCategory, setSelectedEquipCategory] = useState<string | null>(null);

  useEffect(() => {
    const target = passedData || "All";
    const match = allCategories.find(c => c.toLowerCase() === target.toLowerCase());
    if (match) {
      setActiveCategory(match);
      setSelectedEquipCategory(null);
    }
  }, [passedData]);

  const filtered = activeCategory === "All"
    ? facilities
    : facilities.filter((f) => f.facilityCategory === activeCategory);

  const headerContent: Record<string, { title: string, desc: string, icon: any, image: string }> = {
    "CHEMISTRY_LAB": {
      title: "Chemistry Research Laboratory",
      desc: "Advanced facilities for synthesis, structural analysis, and characterization of novel chemical compounds and materials.",
      icon: FlaskConical,
      image: "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1742&q=80"
    },
    "BIOMEDICAL_LAB": {
      title: "Biotechnology & Life Sciences",
      desc: "Cutting-edge tools for molecular biology, genetics, and bio-processing research in a sterile environment.",
      icon: Dna,
      image: "https://images.unsplash.com/photo-1579165466741-7f35e4755660?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
    },
    "ECE_LAB": {
      title: "Electronics & Embedded Systems",
      desc: "State-of-the-art labs for circuit design, semiconductor testing, and the development of next-gen electronics.",
      icon: Cpu,
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
    },
    "EEE_LAB": {
      title: "Electrical Engineering Systems",
      desc: "Integrated power systems, renewable energy testing, and electrical machinery characterization.",
      icon: Zap,
      image: "https://images.unsplash.com/photo-1765830403209-a5eceac4c198?w=800&q=80"
    },
    "PHYSICS_LAB": {
      title: "Advanced Materials Science",
      desc: "Exploring the characterization and development of advanced functional materials and nanotechnology.",
      icon: Atom,
      image: "https://images.unsplash.com/photo-1520038410233-7141be7b6f97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1746&q=80"
    },
    "COMPUTER_LAB": {
      title: "HPC & Computing Laboratory",
      desc: "High-performance computing resources, AI research, and big data analysis for complex scientific simulations.",
      icon: Monitor,
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
    },
    "MECHANICAL_LAB": {
      title: "Mechanical Engineering Laboratory",
      desc: "Advanced research in thermodynamics, fluid mechanics, robotics, and manufacturing systems.",
      icon: Settings2,
      image: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
    }
  };

  const currentHeader = headerContent[activeCategory];

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-multiply"
          style={{
            backgroundImage: currentHeader ? `url('${currentHeader.image}')` : "url('https://images.unsplash.com/photo-1563207153-f4087858c8ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-white/60 z-0 backdrop-blur-[2px]" />
        <div className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 drop-shadow-sm">
            {currentHeader ? currentHeader.title : "Research Facilities"}
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto drop-shadow-sm font-medium">
            {currentHeader ? currentHeader.desc : "Browse our state-of-the-art facilities designed to support cutting-edge research across multiple disciplines"}
          </p>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white min-h-[600px]">
        <div className="max-w-8xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {filtered.length > 0 && (
              <aside className="w-full lg:w-64 shrink-0">
                <div className="sticky top-24">
                  <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest mb-4 border-b pb-2">
                    Navigation
                  </h3>
                  <nav className="flex flex-col gap-1">
                    <button
                      onClick={() => setSelectedEquipCategory(null)}
                      className={`flex items-center gap-2 text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${!selectedEquipCategory
                        ? "text-blue-700 bg-blue-50/80 shadow-sm translate-x-1"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                    >
                      <LayoutGrid className="h-4 w-4" />
                      Laboratory Overview
                    </button>

                    {(() => {
                      const matchingFacilityIds = filtered.map(f => f.id);
                      const hasEquipmentInSystem = equipment.length > 0;

                      let categories = Array.from(new Set(
                        equipment
                          .filter(e => activeCategory === "All" || matchingFacilityIds.includes(e.facilityId))
                          .map(e => e.equipmentCategory)
                          .filter(Boolean)
                      ));

                      const showAllFallback = activeCategory !== "All" && categories.length === 0 && hasEquipmentInSystem;
                      if (showAllFallback) {
                        categories = Array.from(new Set(equipment.map(e => e.equipmentCategory).filter(Boolean)));
                      }

                      if (!hasEquipmentInSystem) {
                        return (
                          <div className="px-3 py-4 text-xs text-amber-600 bg-amber-50 rounded-lg border border-amber-100 mt-2">
                            <p className="font-bold mb-1 flex items-center gap-2">
                              <PackageSearch className="h-3.5 w-3.5" /> Database Empty
                            </p>
                            <p className="opacity-80">No equipment items found in Firestore.</p>
                          </div>
                        );
                      }

                      return (
                        <>
                          {showAllFallback && (
                            <p className="px-3 pb-2 text-[10px] text-amber-500 font-medium italic leading-tight">
                              No items found in this lab specifically. Showing all available instrumentation:
                            </p>
                          )}
                          {categories.map((feature, idx) => {
                            const isActive = selectedEquipCategory === feature;
                            return (
                              <button
                                key={idx}
                                onClick={() => setSelectedEquipCategory(feature)}
                                className={`text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                  ? "text-blue-700 bg-blue-50/80 shadow-sm translate-x-1"
                                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                  }`}
                              >
                                {feature}
                              </button>
                            );
                          })}
                        </>
                      );
                    })()}
                  </nav>
                </div>
              </aside>
            )}

            <div className="flex-1">
              {selectedEquipCategory ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>Facilities</span>
                      <span>/</span>
                      <span className="text-gray-600 font-medium">{categoryDisplayMap[activeCategory] || activeCategory}</span>
                      <span>/</span>
                      <span className="text-blue-600 font-bold uppercase tracking-tight">{selectedEquipCategory}</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedEquipCategory(null)}
                      className="text-gray-500 hover:text-blue-600 gap-1.5"
                    >
                      <ChevronRight className="h-4 w-4 rotate-180" />
                      Back to Overview
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-8 max-w-4xl">
                    {(() => {
                      const matchingFacilityIds = filtered.map(f => f.id);
                      return equipment
                        .filter((e) =>
                          (activeCategory === "All" || matchingFacilityIds.includes(e.facilityId)) &&
                          (e.equipmentCategory.toLowerCase() === selectedEquipCategory.toLowerCase() ||
                            e.equipmentName.toLowerCase().includes(selectedEquipCategory.toLowerCase()))
                        )
                        .map((item) => (
                          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow border-gray-200">
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-xl font-bold text-gray-900">{item.equipmentName}</CardTitle>
                                <Badge
                                  className={`${item.initialStatus === "Available" ? "bg-emerald-500" :
                                    item.initialStatus === "In Use" ? "bg-blue-500" : "bg-rose-500"
                                    } text-white border-0 shadow-sm`}
                                >
                                  {item.initialStatus}
                                </Badge>
                              </div>
                              <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 w-fit">
                                {item.equipmentCategory}
                              </Badge>
                              <CardDescription className="text-gray-600 leading-relaxed mt-2 text-sm">
                                {item.instrumentDescription}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-2 py-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-500">Manufacturer:</span>
                                  <span className="font-medium text-gray-900">{item.manufacturer}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-500">Model:</span>
                                  <span className="font-medium text-gray-900">{item.modelNumber}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-500">Facility:</span>
                                  <span className="font-medium text-gray-900 text-right">
                                    {facilities.find(f => f.id === item.facilityId)?.facilityName || "Research Hub"}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Key Specifications</h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {(item.technicalSpecifications || []).map((spec, idx) => (
                                    <Badge key={idx} variant="outline" className="text-[10px] font-medium border-gray-200 text-gray-500">
                                      {spec}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="pt-2">
                              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm" asChild
                                disabled={item.initialStatus === "Maintenance"}>
                                <Link to="/booking" state={{
                                  equipment: item.equipmentName,
                                  equipCategory: item.equipmentCategory,
                                  equipFacility: facilities.find(f => f.id === item.facilityId)?.facilityName ?? "",
                                  type: "equipment",
                                }}>
                                  {item.initialStatus === "Maintenance" ? "Under Maintenance" : "Reserve This Equipment"}
                                </Link>
                              </Button>
                            </CardFooter>
                          </Card>
                        ))
                    })()}
                  </div>
                </div>
              ) : (
                <div className={`grid gap-6 ${activeCategory !== "All" ? "grid-cols-1 max-w-2xl" : "md:grid-cols-2 lg:grid-cols-3"}`}>
                  {filtered.map((facility) => (
                    <Card key={facility.id} className="overflow-hidden hover:shadow-lg transition-shadow border-gray-200">
                      <div className="relative h-56 overflow-hidden">
                        <ImageWithFallback
                          src={facility.image || ""}
                          alt={facility.facilityName}
                          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4">
                          <Badge
                            className={`${facility.availabilityStatus === "Available" ? "bg-emerald-500" :
                              facility.availabilityStatus === "Limited" ? "bg-amber-500" : "bg-rose-500"
                              } text-white border-0 shadow-sm`}
                          >
                            {facility.availabilityStatus}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-xl font-bold text-gray-900">{facility.facilityName}</CardTitle>
                        </div>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 w-fit">
                          {facility.facilityCategory}
                        </Badge>
                        <CardDescription className="text-gray-600 leading-relaxed mt-2 text-sm">
                          {facility.spaceDescription}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Users className="h-4 w-4" />
                          <span>Maximum capacity: {facility.capacity}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(facility.keyFacilityFeatures || []).map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-[11px] font-medium border-gray-200 text-gray-500">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm" asChild
                          disabled={facility.availabilityStatus === "Unavailable"}>
                          <Link to="/booking" state={{ facility: facility.facilityName, type: "facility" }}>
                            {facility.availabilityStatus === "Unavailable" ? "Temporarily Closed" : "Reserve This Facility"}
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}