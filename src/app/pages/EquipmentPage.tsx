import { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Link } from "react-router";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import { useAppContext } from "../context/AppContext";

export function EquipmentPage() {
  const { equipment: equipmentData, facilities } = useAppContext();

  // Dynamically derive categories from data
  const categories = ["All", ...Array.from(new Set(equipmentData.map(e => e.equipmentCategory).filter(Boolean)))];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const filteredEquipment = equipmentData.filter((item) => {
    const matchesSearch = (item.equipmentName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.instrumentDescription || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.equipmentCategory === selectedCategory;
    const matchesStatus = selectedStatus === "All" || item.initialStatus === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 to-cyan-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Equipment Catalog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Search and browse our extensive collection of research equipment and instrumentation
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b">
        <div className="max-w-8xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search equipment..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="In Use">In Use</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredEquipment.length} of {equipmentData.length} equipment
          </div>
        </div>
      </section>

      {/* Equipment Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((equipment) => (
              <Card key={equipment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-lg leading-tight">{equipment.equipmentName}</CardTitle>
                    <Badge
                      variant={
                        equipment.initialStatus === "Available" ? "default" :
                          equipment.initialStatus === "In Use" ? "secondary" : "destructive"
                      }
                      className={
                        equipment.initialStatus === "Available" ? "bg-green-500" :
                          equipment.initialStatus === "In Use" ? "bg-orange-500" : ""
                      }
                    >
                      {equipment.initialStatus}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="w-fit mb-2">
                    {equipment.equipmentCategory}
                  </Badge>
                  <CardDescription>
                    {equipment.instrumentDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Manufacturer:</span>
                      <span className="font-medium">{equipment.manufacturer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Model:</span>
                      <span className="font-medium">{equipment.modelNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Location:</span>
                      <span className="font-medium text-right">
                        {facilities.find(f => f.id === equipment.facilityId)?.facilityName || "Unknown facility"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Key Specifications:</h4>
                    <div className="flex flex-wrap gap-1">
                      {(equipment.technicalSpecifications || []).map((spec, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Applications:</h4>
                    <div className="flex flex-wrap gap-1">
                      {(equipment.researchApplications || []).map((app, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {app}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild disabled={equipment.initialStatus !== "Available"}>
                    <Link to="/booking">
                      {equipment.initialStatus === "Available" ? "Book Equipment" : equipment.initialStatus}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredEquipment.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No equipment found matching your criteria.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedStatus("All");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}