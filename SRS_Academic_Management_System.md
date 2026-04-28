# Software Requirements Specification (SRS)
## Project: Academic Management & Performance Analytics System

---

## 1. Introduction
### 1.1 Purpose
This document specifies the functional and non-functional requirements for the Academic Management System. It serves as a blueprint for the platform designed to streamline student registration, faculty assignments, marks management, and performance analytics.

### 1.2 Scope
The system is a web-based platform for educational institutions to manage academic records. It replaces manual spreadsheet tracking with a centralized database, automated grading logic, and visual analytics dashboards.

---

## 2. Overall Description
### 2.1 Product Perspective
The system consists of a **React-based Frontend** and a **Node.js/Express Backend** with a **MongoDB** database. It provides distinct interfaces for Administrators, Teachers, and Students.

### 2.2 User Classes and Characteristics
*   **System Administrator**: Full access to data management, bulk uploads, teacher assignments, and global analytics.
*   **Teacher**: Access to assigned subjects, student lists, and marks entry modules.
*   **Student**: Access to personal academic profiles and historical result tracking across multiple semesters.

---

## 3. System Features

### 3.1 Administrative Module
*   **Bulk Student/Teacher Registration**: 
    *   Support for CSV uploads.
    *   Auto-derivation of credentials: `email = regdNo@edu.ppd`, `password = regdNo`.
    *   Cascading selection (Branch → Batch) for target enrollment.
*   **Teacher-Subject Assignment**: 
    *   Interface to link faculty members to specific subjects, batches, and semesters.
    *   Real-time Subject ID mapping.
*   **Marks Management**: 
    *   Bulk upload of final marks via CSV.
    *   Normalization logic based on: Midsem (20), Endsem (60), Quiz (10), and Assignment (10).

### 3.2 Performance Analytics Dashboard
*   **Data Aggregation**:
    *   **Branch Level**: Combines performance data across all batches and subjects.
    *   **Batch Level**: Consolidates results for all subjects within a specific year.
    *   **Subject Level**: Granular analysis of marks distribution and teacher effectiveness.
*   **Visualizations**: Dynamic charts (Recharts) showing grade distributions (O, A, B, C, D, E, F) and average performance metrics.

### 3.3 Student Academic Profile
*   **Multi-Semester Results**: 
    *   Dynamic semester selector based on start year (Aug start, 6-month cycle).
    *   Historical tracking of marks for all completed and ongoing semesters.
*   **Academic KPIs**: Real-time calculation of Average Score and Best Grade per semester.

---

## 4. Technical Requirements

### 4.1 Technology Stack
*   **Frontend**: React 18, Vite, TypeScript, Lucide Icons, Recharts.
*   **Backend**: Node.js, Express, Mongoose (MongoDB).
*   **Security**: JWT (JSON Web Tokens) for session management, BcryptJS for password hashing.
*   **Validation**: Zod for schema validation on both ends.

### 4.2 Grading & Normalization Logic
*   **Total Marks**: 100 points.
*   **Breakdown**: Midsem (20) + Endsem (60) + Quiz (10) + Assignment (10).
*   **Grade Scale**:
    *   **O (Outstanding)**: ≥ 90%
    *   **A (Excellent)**: ≥ 80%
    *   **B (Good)**: ≥ 70%
    *   **C (Average)**: ≥ 60%
    *   **D (Pass)**: ≥ 50%
    *   **E (Marginal)**: ≥ 40%
    *   **F (Fail)**: < 40%

---

## 5. Non-Functional Requirements
*   **Performance**: CSV processing for up to 1000 records should complete within < 5 seconds.
*   **Usability**: Cascading dropdowns (Branch → Batch → Subject) must be used to prevent invalid data selection.
*   **Integrity**: Unique indexes on Teaching Assignments (Teacher-Subject-Batch-Semester) to prevent duplicate scheduling.
