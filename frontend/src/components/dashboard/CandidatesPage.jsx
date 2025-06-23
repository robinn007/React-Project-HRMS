// frontend/src/components/dashboard/CandidatesPage.jsx
import { useState, useEffect, useRef } from "react";
import {
  Search,
  Mail,
  Bell,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Trash2,
  X,
  Upload,
  Download,
  UserPlus,
} from "lucide-react";
import { toast } from "react-toastify";
import * as apiService from "../../services/candidateService"
import useAuth from "../../hooks/useAuth.js";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import PropTypes from "prop-types";
import styles from "./CandidatesPage.module.css";

// Validation schema
const candidateSchema = yup.object({
  name: yup.string().min(2, "Name must be at least 2 characters").required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup
    .string()
    .matches(/^\+?[\d\s-]{10,}$/, "Invalid phone number")
    .required("Phone is required"),
  position: yup.string().required("Position is required"),
  status: yup
    .string()
    .oneOf(["Active", "Pending", "Inactive", "Scheduled", "Ongoing", "Selected", "Rejected"])
    .required("Status is required"),
  experience: yup.string().required("Experience is required"),
   skills: yup.string(),
  resume: yup
    .mixed()
    .test("fileType", "Only PDF, DOC, or DOCX files are allowed", (value) => {
      if (!value || !value[0]) return true;
      return [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(value[0].type);
    })
    .test("fileSize", "File size must be less than 5MB", (value) => {
      if (!value || !value[0]) return true;
      return value[0].size <= 5 * 1024 * 1024;
    }),
});

// Employee creation schema
const employeeSchema = yup.object({
  employeeId: yup.string().required("Employee ID is required"),
  department: yup.string().required("Department is required"),
  salary: yup.number().positive("Salary must be positive").required("Salary is required"),
  joiningDate: yup.date().required("Joining date is required"),
  manager: yup.string(),
  workLocation: yup.string().required("Work location is required"),
  employmentType: yup.string().oneOf(["Full-time", "Part-time", "Contract", "Internship"]).required("Employment type is required"),
});

// Dropdown component
const Dropdown = ({ options, selectedValue, onSelect, triggerLabel, className, triggerClassName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`${styles.customDropdown} ${className}`} ref={dropdownRef}>
      <button
        className={`${styles.dropdownTrigger} ${triggerClassName}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className={styles.dropdownText}>
          {options.find((option) => option.value === selectedValue)?.label || triggerLabel}
        </span>
        <ChevronDown
          className={`${styles.dropdownIcon} ${isOpen ? styles.rotated : ""}`}
          size={16}
        />
      </button>
      {isOpen && (
        <div className={styles.dropdownMenuCustom}>
          {options.map((option) => (
            <button
              key={option.value}
              className={`${styles.dropdownItemCustom} ${
                selectedValue === option.value ? styles.selected : ""
              }`}
              onClick={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
              aria-label={option.label}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

Dropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedValue: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  triggerLabel: PropTypes.string.isRequired,
  className: PropTypes.string,
  triggerClassName: PropTypes.string,
};

// Status dropdown component
const StatusDropdown = ({ candidateId, currentStatus, onStatusUpdate, onCreateEmployee }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const inlineStatusOptions = [
    { value: "Scheduled", label: "Scheduled" },
    { value: "Ongoing", label: "Ongoing" },
    { value: "Selected", label: "Selected" },
    { value: "Rejected", label: "Rejected" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStatusChange = (newStatus) => {
    if (newStatus === "Selected" && currentStatus !== "Selected") {
      // Show confirmation before converting to employee
      if (window.confirm("This candidate will be converted to an employee. Do you want to proceed?")) {
        onCreateEmployee(candidateId);
      }
    } else {
      onStatusUpdate(candidateId, newStatus);
    }
    setIsOpen(false);
  };

  return (
    <div className={styles.inlineStatusDropdown} ref={dropdownRef}>
      <button
        className={styles.statusDropdownTrigger}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          color: getStatusColor(currentStatus),
          backgroundColor: getStatusBackgroundColor(currentStatus),
          border: `1px solid ${getStatusColor(currentStatus)}`,
        }}
        aria-expanded={isOpen}
      >
        <span>{currentStatus}</span>
        <ChevronDown size={12} />
      </button>
      {isOpen && (
        <div className={styles.inlineDropdownMenu}>
          {inlineStatusOptions.map((option) => (
            <button
              key={option.value}
              className={`${styles.inlineDropdownItem} ${
                currentStatus === option.value ? styles.selected : ""
              }`}
              onClick={() => handleStatusChange(option.value)}
              style={{
                backgroundColor: currentStatus === option.value ? getStatusBackgroundColor(option.value) : "transparent",
                color: getStatusColor(option.value),
              }}
              aria-label={`Change status to ${option.label}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

StatusDropdown.propTypes = {
  candidateId: PropTypes.string.isRequired,
  currentStatus: PropTypes.string.isRequired,
  onStatusUpdate: PropTypes.func.isRequired,
  onCreateEmployee: PropTypes.func.isRequired,
};

// Create Employee Modal component
const CreateEmployeeModal = ({ isOpen, onClose, onSubmit, candidateData }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(employeeSchema),
    defaultValues: {
      employeeId: `EMP${Date.now()}`, // Generate default employee ID
      joiningDate: new Date().toISOString().split('T')[0], // Today's date
      workLocation: "Office",
      employmentType: "Full-time",
    },
  });

  const departmentOptions = [
    "Engineering",
    "Human Resources",
    "Marketing",
    "Sales",
    "Finance",
    "Operations",
    "Design",
    "Product Management",
  ];

  const workLocationOptions = [
    "Office",
    "Remote",
    "Hybrid",
  ];

  const employmentTypeOptions = [
    "Full-time",
    "Part-time",
    "Contract",
    "Internship",
  ];

  const handleFormSubmit = async (data) => {
    try {
      const employeeData = {
        ...data,
        candidateId: candidateData._id,
        // Copy relevant candidate data
        name: candidateData.name,
        email: candidateData.email,
        phone: candidateData.phone,
        position: candidateData.position,
        experience: candidateData.experience,
         skills: candidateData.skills,
        resume: candidateData.resume,
      };
      
      await onSubmit(employeeData);
      reset();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create employee");
    }
  };

  if (!isOpen || !candidateData) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.candidateModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Create Employee from Candidate</h2>
          <button className={styles.modalCloseBtn} onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalBody}>
          {/* Display candidate information */}
          <div className={styles.candidateInfo}>
            <h3>Candidate Information</h3>
            <div className={styles.infoGrid}>
              <div><strong>Name:</strong> {candidateData.name}</div>
              <div><strong>Email:</strong> {candidateData.email}</div>
              <div><strong>Phone:</strong> {candidateData.phone}</div>
              <div><strong>Position:</strong> {candidateData.position}</div>
              <div><strong>Experience:</strong> {candidateData.experience}</div>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.candidateForm}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Employee ID <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Enter employee ID"
                  {...register("employeeId")}
                />
                {errors.employeeId && (
                  <span className={styles.errorText}>{errors.employeeId.message}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Department <span className={styles.required}>*</span>
                </label>
                <select
                  className={styles.formInput}
                  {...register("department")}
                >
                  <option value="">Select Department</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && (
                  <span className={styles.errorText}>{errors.department.message}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Salary <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  className={styles.formInput}
                  placeholder="Enter salary"
                  {...register("salary")}
                />
                {errors.salary && (
                  <span className={styles.errorText}>{errors.salary.message}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Joining Date <span className={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  className={styles.formInput}
                  {...register("joiningDate")}
                />
                {errors.joiningDate && (
                  <span className={styles.errorText}>{errors.joiningDate.message}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Manager</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Enter manager name"
                  {...register("manager")}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Work Location <span className={styles.required}>*</span>
                </label>
                <select
                  className={styles.formInput}
                  {...register("workLocation")}
                >
                  {workLocationOptions.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                {errors.workLocation && (
                  <span className={styles.errorText}>{errors.workLocation.message}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Employment Type <span className={styles.required}>*</span>
                </label>
                <select
                  className={styles.formInput}
                  {...register("employmentType")}
                >
                  {employmentTypeOptions.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.employmentType && (
                  <span className={styles.errorText}>{errors.employmentType.message}</span>
                )}
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Employee..." : "Create Employee"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

CreateEmployeeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  candidateData: PropTypes.object,
};

// Add Candidate Modal component
const AddCandidateModal = ({ isOpen, onClose, onSubmit }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(candidateSchema),
    defaultValues: { status: "Pending" },
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only PDF, DOC, or DOCX files are allowed");
        setSelectedFile(null);
        setValue("resume", null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        setSelectedFile(null);
        setValue("resume", null);
        return;
      }
      setSelectedFile(file);
      setValue("resume", e.target.files);
    } else {
      setSelectedFile(null);
      setValue("resume", null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValue("resume", null);
    document.getElementById("resume-upload").value = "";
  };

  const handleFormSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "skills" && value) {
          formData.append(key, JSON.stringify(value.split(",").map((skill) => skill.trim())));
        } else if (key !== "resume" && value) {
          formData.append(key, value);
        }
      });
      if (selectedFile) formData.append("resume", selectedFile);
      await onSubmit(formData);
      reset();
      setSelectedFile(null);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add candidate");
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.candidateModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Add New Candidate</h2>
          <button className={styles.modalCloseBtn} onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.candidateForm}>
            <div className={styles.formGrid}>
              {[
                { name: "name", label: "Full Name", placeholder: "Enter full name" },
                { name: "email", label: "Email Address", type: "email", placeholder: "Enter email address" },
                { name: "phone", label: "Phone Number", placeholder: "Enter phone number" },
                { name: "position", label: "Position", placeholder: "Enter position" },
                { name: "experience", label: "Experience", placeholder: "Enter experience" },
              ].map((field) => (
                <div key={field.name} className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {field.label} <span className={styles.required}>*</span>
                  </label>
                  <input
                    type={field.type || "text"}
                    className={styles.formInput}
                    placeholder={field.placeholder}
                    {...register(field.name)}
                  />
                  {errors[field.name] && (
                    <span className={styles.errorText}>{errors[field.name].message}</span>
                  )}
                </div>
              ))}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Resume</label>
                <div className={styles.fileUploadContainer}>
                  {!selectedFile ? (
                    <>
                      <input
                        type="file"
                        className={styles.fileInput}
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        id="resume-upload"
                      />
                      <label htmlFor="resume-upload" className={styles.fileUploadLabel}>
                        <Upload size={16} />
                        Upload Resume
                      </label>
                    </>
                  ) : (
                    <div className={styles.fileSelected}>
                      <span className={styles.fileName}>{selectedFile.name}</span>
                      <button
                        type="button"
                        className={styles.fileRemoveBtn}
                        onClick={handleRemoveFile}
                        aria-label="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  {errors.resume && <span className={styles.errorText}>{errors.resume.message}</span>}
                </div>
              </div>
            </div>
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="declaration"
                className={styles.checkboxInput}
                required
              />
              <label htmlFor="declaration" className={styles.checkboxLabel}>
                I hereby declare that the above information is true to the best of my knowledge and belief
              </label>
            </div>
            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

AddCandidateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

// Main CandidatesPage component
const CandidatesPage = () => {
  const { user, loading: authLoading, token } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const statusOptions = [
    { value: "all", label: "Status" },
    { value: "Scheduled", label: "Scheduled" },
    { value: "Ongoing", label: "Ongoing" },
    { value: "Selected", label: "Selected" },
    { value: "Rejected", label: "Rejected" },
  ];

  const positionOptions = [
    { value: "all", label: "All Positions" },
    { value: "Software Engineer", label: "Software Engineer" },
    { value: "Software Developer", label: "Software Developer" },
    { value: "UI/UX Developer", label: "UI/UX Developer" },
    { value: "Project Manager", label: "Project Manager" },
    { value: "Designer", label: "Designer" },
    { value: "Human Resource", label: "Human Resource" },
  ];

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      let userId = user?._id;
      if (!userId && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          userId = parsedUser?._id || parsedUser?.id;
        } catch (error) {
          console.error("Error parsing stored user:", error);
        }
      }

      const authToken = token || storedToken;
      if (!authToken || !userId) {
        throw new Error("Authentication required. Please log in again.");
      }

      const params = {
        search: searchTerm || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        position: positionFilter === "all" ? undefined : positionFilter,
        userId,
      };

      const data = await apiService.getCandidates(params);
      setCandidates(data);
      if (data.length === 0) {
        setErrorMessage("No candidates found. Try adding a new candidate or adjust filters.");
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to fetch candidates.";
      setErrorMessage(message);
      toast.error(message);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (user?._id || localStorage.getItem("user"))) {
      fetchCandidates();
    } else if (!authLoading) {
      setErrorMessage("Please log in to view candidates.");
    }
  }, [authLoading, user, searchTerm, statusFilter, positionFilter]);

  const handleDeleteCandidate = async (candidateId) => {
    try {
      await apiService.deleteCandidate(candidateId);
      setCandidates((prev) => prev.filter((candidate) => candidate._id !== candidateId));
      toast.success("Candidate deleted successfully");
      setShowDropdown(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete candidate");
    }
  };

  const handleDownloadResume = async (candidateId, candidateName) => {
    try {
      const response = await apiService.downloadResume(candidateId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${candidateName}-resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setShowDropdown(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to download resume");
    }
  };

  const handleStatusUpdate = async (candidateId, newStatus) => {
    try {
      await apiService.updateCandidateStatus(candidateId, newStatus);
      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate._id === candidateId ? { ...candidate, status: newStatus } : candidate
        )
      );
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleCreateEmployee = async (candidateId) => {
    try {
      const candidate = candidates.find(c => c._id === candidateId);
      if (!candidate) {
        toast.error("Candidate not found");
        return;
      }
      
      setSelectedCandidate(candidate);
      setShowEmployeeModal(true);
    } catch (error) {
      toast.error("Failed to prepare employee creation");
    }
  };

  const handleEmployeeSubmit = async (employeeData) => {
    try {
      await apiService.createEmployee(employeeData);
      
      // Update candidate status to Selected
      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate._id === employeeData.candidateId 
            ? { ...candidate, status: "Selected" } 
            : candidate
        )
      );
      
      toast.success("Employee created successfully!");
      setShowEmployeeModal(false);
      setSelectedCandidate(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create employee");
    }
  };

  const handleAddCandidate = async (formData) => {
    const response = await apiService.createCandidate(formData);
    setCandidates((prev) => [response.data, ...prev]);
    toast.success("Candidate added successfully");
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Candidates</h1>
        </div>
        <div className={styles.headerRight}>
          <Mail className={styles.headerIcon} size={20} aria-label="Messages" />
          <div className={styles.notificationIcon}>
            <Bell size={20} aria-label="Notifications" />
            <span className={styles.notificationBadge}></span>
          </div>
          <div className={styles.userProfile}>
            <img
              src="https://images.unsplash.com/photo-1747491681738-d0ed9a30fed3?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="User avatar"
              className={styles.userAvatar}
            />
            <ChevronDown size={16} className={styles.userDropdown} />
          </div>
        </div>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.filtersSection}>
          <div className={styles.filtersLeft}>
            <Dropdown
              options={statusOptions}
              selectedValue={statusFilter}
              onSelect={setStatusFilter}
              triggerLabel="All Statuses"
              triggerClassName={styles.statusDropdown}
            />
            <Dropdown
              options={positionOptions}
              selectedValue={positionFilter}
              onSelect={setPositionFilter}
              triggerLabel="All Positions"
              triggerClassName={styles.positionDropdown}
            />
          </div>
          <div className={styles.filtersRight}>
            <div className={styles.searchContainer}>
              <Search className={styles.searchIcon} size={16} />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
                aria-label="Search candidates"
              />
            </div>
            <button
              className={styles.addBtn}
              onClick={() => setShowAddModal(true)}
              aria-label="Add new candidate"
            >
              <Plus size={16} />
              Add Candidate
            </button>
          </div>
        </div>

        {authLoading ? (
          <div className={styles.loading}>Loading authentication...</div>
        ) : loading ? (
          <div className={styles.loading}>Loading candidates...</div>
        ) : errorMessage ? (
          <div className={styles.errorMessage}>{errorMessage}</div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.candidatesTable}>
              <thead>
                <tr className={styles.tableHeader}>
                  <th>Sr No.</th>
                  <th>Candidates Name</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Experience</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {candidates.length > 0 ? (
                  candidates.map((candidate, index) => (
                    <tr key={candidate._id} className={styles.tableRow}>
                      <td>{index + 1}</td>
                      <td className={styles.nameCell}>{candidate.name}</td>
                      <td>{candidate.email}</td>
                      <td>{candidate.phone}</td>
                      <td>{candidate.position}</td>
                      <td>
                        <StatusDropdown
                          candidateId={candidate._id}
                          currentStatus={candidate.status}
                          onStatusUpdate={handleStatusUpdate}
                          onCreateEmployee={handleCreateEmployee}
                        />
                      </td>
                      <td>{candidate.experience}</td>
                      <td>
                        <div className={styles.actionCell}>
                          <button
                            className={styles.actionBtn}
                            onClick={() =>
                              setShowDropdown((prev) =>
                                prev === candidate._id ? null : candidate._id
                              )
                            }
                            aria-label="More actions"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {showDropdown === candidate._id && (
                            <div className={styles.dropdownMenu}>
                              <button
                                className={styles.dropdownItem}
                                onClick={() =>
                                  handleDownloadResume(candidate._id, candidate.name)
                                }
                                disabled={!candidate.resume}
                                aria-label="Download resume"
                              >
                                <Download size={14} />
                                Download Resume
                              </button>
                              {candidate.status === "Selected" && (
                                <button
                                  className={styles.dropdownItem}
                                  onClick={() => handleCreateEmployee(candidate._id)}
                                  aria-label="Create employee"
                                >
                                  <UserPlus size={14} />
                                  Create Employee
                                </button>
                              )}
                              <button
                                className={`${styles.dropdownItem} ${styles.delete}`}
                                onClick={() => handleDeleteCandidate(candidate._id)}
                                aria-label="Delete candidate"
                              >
                                <Trash2 size={14} />
                                Delete Candidate
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className={styles.noData}>
                      No candidates found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddCandidateModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddCandidate}
      />

      <CreateEmployeeModal
        isOpen={showEmployeeModal}
        onClose={() => {
          setShowEmployeeModal(false);
          setSelectedCandidate(null);
        }}
        onSubmit={handleEmployeeSubmit}
        candidateData={selectedCandidate}
      />
    </div>
  );
};

// Status color helpers
const getStatusColor = (status) => {
  const statusColors = {
    scheduled: "#f59e0b",
    selected: "#10b981",
    rejected: "#ef4444",
    ongoing: "#3b82f6",
    active: "#10b981",
    pending: "#f59e0b",
    inactive: "#6b7280",
  };
  return statusColors[status?.toLowerCase()] || "#6b7280";
};

const getStatusBackgroundColor = (status) => {
  const statusBackgroundColors = {
    scheduled: "#fef3c7",
    selected: "#d1fae5",
    rejected: "#fee2e2",
    ongoing: "#dbeafe",
    active: "#d1fae5",
    pending: "#fef3c7",
    inactive: "#f3f4f6",
  };
  return statusBackgroundColors[status?.toLowerCase()] || "#f3f4f6";
};

export default CandidatesPage;