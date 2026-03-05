"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  EducationalBackground,
  WorkExperience,
  FamilyMember,
  CourseTraining,
} from "@/types";

export default function CandidateProfilePage() {
  // Personal Information State
  const [formData, setFormData] = React.useState({
    fullName: "",
    idNumber: "",
    city: "",
    taxIdNumber: "",
    nationality: "",
    bpjsKesehatanNumber: "",
    religion: "",
    bpjsKetenagakerjaanNumber: "",
    ethnicGroup: "",
    mobilePhone: "",
    address: "",
    personalEmail: "",
    domicileAddress: "",
    drivingLicense: "",
    birthPlace: "",
    residentialStatus: "",
    gender: "",
    numberOfDependents: 0,
    birthDate: "",
    uniformShirtSize: "",
    maritalStatus: "",
    uniformPantsSize: "",
  });

  // Table Data State
  const [educationalBackground, setEducationalBackground] = React.useState<EducationalBackground[]>([]);
  const [workExperience, setWorkExperience] = React.useState<WorkExperience[]>([]);
  const [familyMembers, setFamilyMembers] = React.useState<FamilyMember[]>([]);
  const [courseTraining, setCourseTraining] = React.useState<CourseTraining[]>([]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    console.log("Educational Background:", educationalBackground);
    console.log("Work Experience:", workExperience);
    console.log("Family Members:", familyMembers);
    console.log("Course/Training:", courseTraining);
  };

  const addEducation = () => {
    setEducationalBackground((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        schoolUniversity: "",
        city: "",
        degree: "",
        major: "",
        yearGraduate: new Date().getFullYear(),
      },
    ]);
  };

  const addWorkExperience = () => {
    setWorkExperience((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        company: "",
        city: "",
        jobTitle: "",
        period: "",
        lengthOfWorking: "",
      },
    ]);
  };

  const addFamilyMember = () => {
    setFamilyMembers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "",
        relation: "",
        age: 0,
        education: "",
        work: "",
      },
    ]);
  };

  const addCourseTraining = () => {
    setCourseTraining((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        courseTopic: "",
        provider: "",
        year: new Date().getFullYear(),
        city: "",
        certificate: "",
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
              <span className="text-sm font-semibold text-accent-foreground">Q</span>
            </div>
            <span className="text-lg font-semibold">QuoHRIS</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <span className="text-xs font-medium text-muted-foreground">GA</span>
            </div>
            <span className="text-sm text-muted-foreground">Guest</span>
          </div>
        </div>
      </header>

      {/* Application Header */}
      <div className="border-b bg-muted/30">
        <div className="px-6 py-4">
          <h1 className="text-xl font-semibold text-accent">AP.2602110001</h1>
          <Badge variant="default" className="mt-2">
            Profile
          </Badge>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        {/* Personal Information Section */}
        <div className="rounded-lg border-l-4 border-l-accent bg-card">
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="Input Full Name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  required
                />
              </div>

              {/* ID Number */}
              <div className="space-y-2">
                <Label htmlFor="idNumber">
                  ID Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="idNumber"
                  placeholder="Input ID Number"
                  value={formData.idNumber}
                  onChange={(e) => handleInputChange("idNumber", e.target.value)}
                  required
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="city"
                  placeholder="Input City"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  required
                />
              </div>

              {/* TAX ID Number */}
              <div className="space-y-2">
                <Label htmlFor="taxIdNumber">
                  TAX ID Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="taxIdNumber"
                  placeholder="Input TAX ID Number"
                  value={formData.taxIdNumber}
                  onChange={(e) => handleInputChange("taxIdNumber", e.target.value)}
                  required
                />
              </div>

              {/* Nationality */}
              <div className="space-y-2">
                <Label htmlFor="nationality">
                  Nationality <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nationality"
                  placeholder="Input Nationality"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange("nationality", e.target.value)}
                  required
                />
              </div>

              {/* BPJS Kesehatan Number */}
              <div className="space-y-2">
                <Label htmlFor="bpjsKesehatanNumber">
                  BPJS Kesehatan Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="bpjsKesehatanNumber"
                  placeholder="Input BPJS Kesehatan Number"
                  value={formData.bpjsKesehatanNumber}
                  onChange={(e) => handleInputChange("bpjsKesehatanNumber", e.target.value)}
                  required
                />
              </div>

              {/* Religion */}
              <div className="space-y-2">
                <Label htmlFor="religion">
                  Religion <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="religion"
                  placeholder="Input Religion"
                  value={formData.religion}
                  onChange={(e) => handleInputChange("religion", e.target.value)}
                  required
                />
              </div>

              {/* BPJS Ketenagakerjaan Number */}
              <div className="space-y-2">
                <Label htmlFor="bpjsKetenagakerjaanNumber">
                  BPJS Ketenagakerjaan Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="bpjsKetenagakerjaanNumber"
                  placeholder="Input BPJS Ketenagakerjaan Number"
                  value={formData.bpjsKetenagakerjaanNumber}
                  onChange={(e) => handleInputChange("bpjsKetenagakerjaanNumber", e.target.value)}
                  required
                />
              </div>

              {/* Ethnic Group */}
              <div className="space-y-2">
                <Label htmlFor="ethnicGroup">
                  Ethnic Group <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ethnicGroup"
                  placeholder="Input Ethnic Group"
                  value={formData.ethnicGroup}
                  onChange={(e) => handleInputChange("ethnicGroup", e.target.value)}
                  required
                />
              </div>

              {/* Mobile Phone */}
              <div className="space-y-2">
                <Label htmlFor="mobilePhone">
                  Mobile Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="mobilePhone"
                  placeholder="Input Mobile Phone"
                  value={formData.mobilePhone}
                  onChange={(e) => handleInputChange("mobilePhone", e.target.value)}
                  required
                />
              </div>

              {/* Address (According to ID) */}
              <div className="space-y-2">
                <Label htmlFor="address">
                  Address (According to ID) <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="address"
                  placeholder="Input Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required
                  rows={3}
                />
              </div>

              {/* Personal Email */}
              <div className="space-y-2">
                <Label htmlFor="personalEmail">
                  Personal Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="personalEmail"
                  type="email"
                  placeholder="Input Personal Email"
                  value={formData.personalEmail}
                  onChange={(e) => handleInputChange("personalEmail", e.target.value)}
                  required
                />
              </div>

              {/* Domicile Address */}
              <div className="space-y-2">
                <Label htmlFor="domicileAddress">
                  Domicile Address <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="domicileAddress"
                  placeholder="Input Domicile Address"
                  value={formData.domicileAddress}
                  onChange={(e) => handleInputChange("domicileAddress", e.target.value)}
                  required
                  rows={3}
                />
              </div>

              {/* Driving License */}
              <div className="space-y-2">
                <Label htmlFor="drivingLicense">Driving License</Label>
                <Select
                  value={formData.drivingLicense}
                  onValueChange={(value) => handleInputChange("drivingLicense", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select driving license" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="A">SIM A</SelectItem>
                    <SelectItem value="B1">SIM B1</SelectItem>
                    <SelectItem value="B2">SIM B2</SelectItem>
                    <SelectItem value="C">SIM C</SelectItem>
                    <SelectItem value="D">SIM D</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Birth Place */}
              <div className="space-y-2">
                <Label htmlFor="birthPlace">
                  Birth Place <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="birthPlace"
                  placeholder="Input Birthday Place"
                  value={formData.birthPlace}
                  onChange={(e) => handleInputChange("birthPlace", e.target.value)}
                  required
                />
              </div>

              {/* Residential Status */}
              <div className="space-y-2">
                <Label htmlFor="residentialStatus">
                  Residential Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.residentialStatus}
                  onValueChange={(value) => handleInputChange("residentialStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select residential status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="own">Own House</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="family">Living with Family</SelectItem>
                    <SelectItem value="company">Company Housing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Number of Dependents */}
              <div className="space-y-2">
                <Label htmlFor="numberOfDependents">Number of Dependents</Label>
                <Input
                  id="numberOfDependents"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.numberOfDependents}
                  onChange={(e) => handleInputChange("numberOfDependents", parseInt(e.target.value) || 0)}
                />
              </div>

              {/* Birth Date */}
              <div className="space-y-2">
                <Label htmlFor="birthDate">
                  Birth Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange("birthDate", e.target.value)}
                  required
                />
              </div>

              {/* Uniform Shirt Size */}
              <div className="space-y-2">
                <Label>
                  Uniform Shirt Size <span className="text-destructive">*</span>
                </Label>
                <RadioGroup
                  value={formData.uniformShirtSize}
                  onValueChange={(value) => handleInputChange("uniformShirtSize", value)}
                  className="flex flex-wrap gap-4"
                >
                  {["S", "M", "L", "XXL", "Other"].map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <RadioGroupItem value={size.toLowerCase()} id={`shirt-${size}`} />
                      <Label htmlFor={`shirt-${size}`} className="font-normal cursor-pointer">
                        {size}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Marital Status */}
              <div className="space-y-2">
                <Label htmlFor="maritalStatus">Marital Status</Label>
                <Select
                  value={formData.maritalStatus}
                  onValueChange={(value) => handleInputChange("maritalStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Uniform Pants Size */}
              <div className="space-y-2">
                <Label>
                  Uniform Pants Size <span className="text-destructive">*</span>
                </Label>
                <RadioGroup
                  value={formData.uniformPantsSize}
                  onValueChange={(value) => handleInputChange("uniformPantsSize", value)}
                  className="flex flex-wrap gap-4"
                >
                  {["31", "32", "33", "34", "35", "36", "Other"].map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <RadioGroupItem value={size.toLowerCase()} id={`pants-${size}`} />
                      <Label htmlFor={`pants-${size}`} className="font-normal cursor-pointer">
                        {size}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        </div>

        {/* Educational Background Section */}
        <div className="mt-8 rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="font-semibold">Educational Background</h2>
            <Button type="button" onClick={addEducation} size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add New
            </Button>
          </div>
          <div className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>School/University</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Degree</TableHead>
                  <TableHead>Major</TableHead>
                  <TableHead>Year (Graduate)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {educationalBackground.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No data available. Click &quot;Add New&quot; to add educational background.
                    </TableCell>
                  </TableRow>
                ) : (
                  educationalBackground.map((edu, index) => (
                    <TableRow key={edu.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Input
                          placeholder="School/University"
                          value={edu.schoolUniversity}
                          onChange={(e) => {
                            const updated = [...educationalBackground];
                            updated[index].schoolUniversity = e.target.value;
                            setEducationalBackground(updated);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="City"
                          value={edu.city}
                          onChange={(e) => {
                            const updated = [...educationalBackground];
                            updated[index].city = e.target.value;
                            setEducationalBackground(updated);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Degree"
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = [...educationalBackground];
                            updated[index].degree = e.target.value;
                            setEducationalBackground(updated);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Major"
                          value={edu.major}
                          onChange={(e) => {
                            const updated = [...educationalBackground];
                            updated[index].major = e.target.value;
                            setEducationalBackground(updated);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="Year"
                          value={edu.yearGraduate}
                          onChange={(e) => {
                            const updated = [...educationalBackground];
                            updated[index].yearGraduate = parseInt(e.target.value) || 0;
                            setEducationalBackground(updated);
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Work Experience Section */}
        <div className="mt-8 rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="font-semibold">Work Experience</h2>
            <Button type="button" onClick={addWorkExperience} size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add New
            </Button>
          </div>
          <div className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Length of Working</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workExperience.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No data available. Click &quot;Add New&quot; to add work experience.
                    </TableCell>
                  </TableRow>
                ) : (
                  workExperience.map((work, index) => (
                    <TableRow key={work.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Input
                          placeholder="Company"
                          value={work.company}
                          onChange={(e) => {
                            const updated = [...workExperience];
                            updated[index].company = e.target.value;
                            setWorkExperience(updated);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="City"
                          value={work.city}
                          onChange={(e) => {
                            const updated = [...workExperience];
                            updated[index].city = e.target.value;
                            setWorkExperience(updated);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Job Title"
                          value={work.jobTitle}
                          onChange={(e) => {
                            const updated = [...workExperience];
                            updated[index].jobTitle = e.target.value;
                            setWorkExperience(updated);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Period"
                          value={work.period}
                          onChange={(e) => {
                            const updated = [...workExperience];
                            updated[index].period = e.target.value;
                            setWorkExperience(updated);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Length of Working"
                          value={work.lengthOfWorking}
                          onChange={(e) => {
                            const updated = [...workExperience];
                            updated[index].lengthOfWorking = e.target.value;
                            setWorkExperience(updated);
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Family Members Section */}
        <div className="mt-8 rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="font-semibold">Family Members</h2>
            <Button type="button" onClick={addFamilyMember} size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add New
            </Button>
          </div>
          <div className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Relation</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Education</TableHead>
                  <TableHead>Work</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {familyMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No data available. Click &quot;Add New&quot; to add family member.
                    </TableCell>
                  </TableRow>
                ) : (
                  familyMembers.map((member, index) => (
                    <TableRow key={member.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Input
                          placeholder="Name"
                          value={member.name}
                          onChange={(e) => {
                            const updated = [...familyMembers];
                            updated[index].name = e.target.value;
                            setFamilyMembers(updated);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Relation"
                          value={member.relation}
                          onChange={(e) => {
                            const updated = [...familyMembers];
                            updated[index].relation = e.target.value;
                            setFamilyMembers(updated);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="Age"
                          value={member.age}
                          onChange={(e) => {
                            const updated = [...familyMembers];
                            updated[index].age = parseInt(e.target.value) || 0;
                            setFamilyMembers(updated);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Education"
                          value={member.education}
                          onChange={(e) => {
                            const updated = [...familyMembers];
                            updated[index].education = e.target.value;
                            setFamilyMembers(updated);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Work"
                          value={member.work}
                          onChange={(e) => {
                            const updated = [...familyMembers];
                            updated[index].work = e.target.value;
                            setFamilyMembers(updated);
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Course / Training Experience Section */}
        <div className="mt-8 rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="font-semibold">Course / Training Experience</h2>
            <Button type="button" onClick={addCourseTraining} size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add New
            </Button>
          </div>
          <div className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Course Topic</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Certificate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courseTraining.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No data available. Click &quot;Add New&quot; to add course/training experience.
                    </TableCell>
                  </TableRow>
                ) : (
                  courseTraining.map((course, index) => (
                    <TableRow key={course.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Input
                          placeholder="Course Topic"
                          value={course.courseTopic}
                          onChange={(e) => {
                            const updated = [...courseTraining];
                            updated[index].courseTopic = e.target.value;
                            setCourseTraining(updated);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Provider"
                          value={course.provider}
                          onChange={(e) => {
                            const updated = [...courseTraining];
                            updated[index].provider = e.target.value;
                            setCourseTraining(updated);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="Year"
                          value={course.year}
                          onChange={(e) => {
                            const updated = [...courseTraining];
                            updated[index].year = parseInt(e.target.value) || 0;
                            setCourseTraining(updated);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="City"
                          value={course.city}
                          onChange={(e) => {
                            const updated = [...courseTraining];
                            updated[index].city = e.target.value;
                            setCourseTraining(updated);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Certificate"
                          value={course.certificate}
                          onChange={(e) => {
                            const updated = [...courseTraining];
                            updated[index].certificate = e.target.value;
                            setCourseTraining(updated);
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <Button type="submit" size="lg">
            Save & Continue
          </Button>
        </div>
      </form>
    </div>
  );
}
