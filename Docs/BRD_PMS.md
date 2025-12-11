
# **1. EXECUTIVE SUMMARY**

This Business Requirements Document defines the functional and non-functional requirements for a comprehensive Pharmacy Management Application designed to support Admins, Doctors, Pharmacists, Sales Reps, and Customers. The system integrates medicine catalog management, appointments, prescriptions, inventory, pricing, billing, analytics, and multi-store operations.

**Business Goals:**

* Centralize pharmacy workflows
* Ensure accuracy and compliance in prescriptions & billing
* Improve doctor–patient experience via appointments & prescriptions
* Automate inventory and GST-compliant billing
* Provide advanced reporting for decision-making
* Support scalability across multiple pharmacy locations

---

# **2. BUSINESS CONTEXT & SCOPE**

## **2.1 Problem Statement**

Pharmacies and clinics struggle with:

* Manual inventory tracking causing stockouts
* Fragmented prescription and sales workflows
* Lack of appointment scheduling for doctors
* Inefficient billing and unclear GST compliance
* Limited visibility into profitability and sales trends
* No unified system for multi-store operations

## **2.2 Solution Overview**

The Pharmacy Management Application will:

* Provide role-based access control
* Enable appointments booking, scheduling, and display
* Streamline prescription creation and fulfillment
* Automate inventory and expiry tracking
* Provide GST-compliant invoicing & billing
* Offer customer profiles and repeat order management
* Deliver real-time analytics and dashboards
* Support multi-location operations via centralized control

## **2.3 Scope Definition**

### **IN SCOPE**

* User management & authentication
* Appointment scheduling & doctor availability
* Prescription creation and fulfillment
* Medicine catalog and inventory management
* POS billing with discounts & multi-payment support
* Invoice generation/modification/cancellation
* Customer profiles and history
* Sales, inventory, financial & compliance reports
* Multi-store support
* Email/SMS notifications (phase-dependent)

### **OUT OF SCOPE (Future Phases)**

* Telemedicine/video consultation (Phase 3)
* Insurance claims
* AI-based recommendations (Phase 3)
* Mobile app (Phase 2)
* Third-party logistics integrations

---

# **3. USER ROLES & PERMISSIONS**

## **3.1 Role Definitions**

| Role           | Responsibilities                                          | Permission Scope          |
| -------------- | --------------------------------------------------------- | ------------------------- |
| **Admin**      | System configuration, user management, reporting          | Full system access        |
| **Doctor**     | Appointments, prescriptions, patient consultations        | Limited to their patients |
| **Pharmacist** | Fulfill prescriptions, manage POS, manage inventory       | Store operations          |
| **Sales Rep**  | Customer engagement, sales tracking                       | Assigned customers        |
| **Customer**   | View prescriptions, book appointments, purchase medicines | Self-service              |

---

## **3.2 Permissions Summary**

### **Admin**

* Manage users, roles, stores
* Full CRUD on medicines, inventory, prescriptions, appointments
* View all reports
* Configure GST, system settings
* Access compliance and audit logs

### **Doctor**

* Manage own schedule and availability
* Create/update prescriptions
* View patients & appointment history
* Update appointment status

### **Pharmacist**

* Fulfill prescriptions
* Process POS sales
* Manage inventory
* View store-level reports
* Manage appointments for store

### **Sales Rep**

* View assigned customers
* Track interactions
* View purchase history
* Generate personal sales reports

### **Customer**

* View prescriptions
* Book/reschedule/cancel appointments
* View invoices & order history
* Manage profile

---

# **4. SYSTEM ARCHITECTURE & DATA MODEL**

## **4.1 Core Entities**

1. Users
2. Doctors
3. Appointments
4. Medicines
5. Prescriptions
6. Transactions & Invoices
7. Inventory
8. Stores
9. Discounts
10. Customer Profiles

---

## **4.2 Updated ER Diagram (Including Appointments)**

```
User (Admin/Pharmacist) (1) -------- (M) Appointment
Doctor (1) -------------------------- (M) Appointment
Patient (Customer) (1) -------------- (M) Appointment

Doctor (1) ------ (M) Prescription
Patient (1) ----- (M) Prescription
Prescription (1) -(M) Prescription_Item

Medicine (1) ---- (M) Inventory
Medicine (1) ---- (M) Transaction_Item
Store (1) ------- (M) Inventory
Store (1) ------- (M) Appointment_Display

Appointment (1) ---(M) Appointment_Status_History
```

---

## **4.3 Updated Data Fields**

### **Appointment Table**

* appointment_id (PK)
* doctor_id (FK)
* patient_id (FK)
* appointment_date
* time_slot_start
* time_slot_end
* status (Scheduled/Confirmed/Completed/Cancelled/No-show)
* visit_type
* notes
* created_by
* updated_by
* created_at
* updated_at

### **Doctor Availability Table**

* doctor_id (FK)
* day_of_week
* slot_start_time
* slot_end_time
* break_start (optional)
* break_end (optional)
* is_active

---

# 🚀 **PART 2 — Updated Section 5 (Functional Requirements), including the NEW 5.4 Appointment Management**

I will deliver this in the next message to ensure clean formatting and avoid truncation.

### It will include:

### ✔ 5.1 User Management

### ✔ 5.2 Medicine & Inventory

### ✔ 5.3 Prescription

### ⭐ **5.4 Appointment Management (new)**

### ✔ 5.5 Pricing & Discounts

### ✔ 5.6 Transactions & Billing

### ✔ 5.7 Customer Management

### ✔ 5.8 Reporting

---


# **5. CORE FUNCTIONAL REQUIREMENTS (UPDATED)**

---

# **5.1 User Management & Authentication**

## **5.1.1 User Registration & Login**

* Support login via email/phone & password
* Password policy enforcement
* OTP verification (optional phase)
* Automatic logout on inactivity
* Account lockout after failed attempts

## **5.1.2 Role-Based Access Control (RBAC)**

* Users assigned to one or more roles
* Permissions enforced at UI & API level
* Each role sees a customized dashboard
* Audit logging of all role changes

## **5.1.3 User Profile Management**

* View & edit personal information
* Change password
* View login history
* Download profile data

---

# **5.2 Medicine & Inventory Management**

## **5.2.1 Medicine Catalog**

* Add/edit/delete medicines
* Track variants & strengths
* Bulk CSV import
* Search & filtering
* Track MRP, GST rate, expiry, manufacturer

## **5.2.2 Inventory Tracking**

* Real-time stock updates
* Low-stock alerts
* Expiry alerts (30/60/90 days)
* Inventory adjustments
* FIFO-based stock rotation
* Stock transfer between stores

## **5.2.3 Reorder Management**

* Auto-generate reorder suggestions
* Store-level reorder configuration
* Purchase order creation
* Supplier tracking

---

# **5.3 Prescription Management**

## **5.3.1 Prescription Creation (Doctor)**

* Add patient info & history
* Add medicines with dosage & instructions
* Validity period
* Interaction warnings (basic)
* Prescription reference number

## **5.3.2 Prescription Fulfillment (Pharmacist)**

* Search prescription
* Validate stock before fulfillment
* Mark items fulfilled/out-of-stock
* Print pickup slip
* Notify customer when ready

## **5.3.3 Prescription Tracking**

* Status lifecycle: pending → partial → fulfilled → expired
* Hold prescription with reason
* Support repeat/refill tracking
* Patient-level prescription history

---

# ⭐ **5.4 Doctor Appointment Management (NEW)**

The system will allow booking, updating, managing, and displaying doctor appointments. This module integrates directly into doctor, pharmacist/reception, and customer experiences.

---

## **5.4.1 Appointment Creation**

### Functional Requirements

* Appointments can be created by:

  * Admin
  * Pharmacist/Receptionist
  * Doctor
  * Customer (self-booking)
* Required fields:

  * Doctor
  * Patient
  * Date & time
  * Visit type (Consultation / Follow-up / Prescription review)
  * Notes (optional)
* Automatic conflict checks (no overlaps unless explicitly allowed).
* Confirmations via email/SMS (if enabled).

### Acceptance Criteria

* Appointment only saved if doctor availability matches.
* Confirmation displayed immediately after booking.
* Appointment visible instantly in all relevant dashboards.

---

## **5.4.2 Appointment Display (Monitor View)**

A dedicated display mode for lobby/reception monitors.

### Functional Requirements

* Displays today's appointments for all doctors
* Auto-refresh every 30 seconds
* Large, readable UI suitable for wall-mounted screens
* Filters:

  * Doctor
  * Time slot (Morning/Afternoon/Evening)
* Display fields:

  * Patient name (or masked)
  * Appointment time
  * Doctor name
  * Status

### Acceptance Criteria

* Display refreshes without page reload
* Readable from 5–10 feet away
* Highlight ongoing or checked-in appointments

---

## **5.4.3 Appointment Management (Edit, Reschedule, Cancel)**

### Functional Requirements

* Edit appointments: change time, date, notes
* Status transitions:

  * Scheduled → Confirmed/Checked-in
  * Confirmed → Completed/Cancelled/No-show
* Cancel appointment (with reason)
* View appointment history for each patient
* Rescheduling must check against updated doctor availability

### Acceptance Criteria

* Changes visible across doctor and clinic dashboards instantly
* No double-booking allowed
* Cancellations logged in audit trail

---

## **5.4.4 Doctor Schedule Management**

### Functional Requirements

* Define availability grid by:

  * Days
  * Time ranges
  * Consultation duration
  * Breaks
* Block off times for:

  * Leave
  * Meeting
  * Emergency
* System auto-generates time slots from availability settings

### Acceptance Criteria

* Only allowed slots available for selection
* Schedule changes propagate immediately to booking UI

---

## **5.4.5 Appointment Dashboard (Role-Based)**

### Admin & Receptionist View

* Today's appointments
* Upcoming appointments
* Filters: doctor, patient, visit type, status
* Quick actions:

  * Check-in
  * Reschedule
  * Cancel

### Doctor View

* Today's schedule
* Appointment history
* One-click status updates
* Access patient history and notes

### Acceptance Criteria

* Dashboards load with accurate role-based data
* Doctor dashboard updates in real time during schedule changes

---

## **5.4.6 Notifications (Email/SMS)**

*(Phase-dependent)*

* Confirmation
* Reminder (24 hours before)
* Rescheduling
* Cancellation

### Acceptance Criteria

* Logs available for all notifications
* Notifications triggered on status changes

---

## **5.4.7 Appointment Data Model (New Tables)**

### Appointment Table

* appointment_id (PK)
* patient_id (FK)
* doctor_id (FK)
* appointment_date
* time_slot_start
* time_slot_end
* visit_type
* status
* notes
* created_by
* updated_by
* created_at
* updated_at

### Doctor_Availability Table

* doctor_id (FK)
* day_of_week
* slot_start_time
* slot_end_time
* break_start (optional)
* break_end (optional)
* is_active

---

## **5.4.8 Updated User Permissions**

| Role                        | Permissions                                       |
| --------------------------- | ------------------------------------------------- |
| **Admin**                   | Full CRUD on all appointments & schedules         |
| **Doctor**                  | View/manage schedule, update appointment statuses |
| **Pharmacist/Receptionist** | Create/edit/cancel appointments                   |
| **Sales Rep**               | View assigned customer appointments (read-only)   |
| **Customer**                | Create/reschedule/cancel own appointments         |

---

## **5.4.9 Updated User Journeys**

### Doctor Journey Additions

* View today’s appointments
* Mark appointment completed
* Manage availability

### Customer Journey Additions

* Book appointment with doctor
* Reschedule/cancel appointment
* Receive reminders

### Pharmacist/Receptionist Journey Additions

* Create appointments for walk-in patients
* Check-in patients
* Display appointments on monitor

---

# **5.5 Pricing & Discount Management**

*(Previously 5.4 — renumbered to 5.5)*

## **5.5.1 Pricing Structure**

* Multiple pricing tiers
* Automated GST calculation
* Price history tracking
* Bulk updates

## **5.5.2 Discount Management**

* Fixed & percentage discounts
* BOGO & promotional offers
* Customer-tier-based discounts
* Impact tracking on margins

## **5.5.3 Special Offers**

* Time-bound promotions
* Coupon codes
* Category-level targeting

---

# **5.6 Transaction & Billing**

*(Previously 5.5 — renumbered to 5.6)*

## **5.6.1 POS Transactions**

* Barcode/manual entry
* Real-time stock validation
* Discounts
* Payment types: cash/card/UPI
* Tender management

## **5.6.2 Invoice Generation**

* GST-compliant invoices
* Auto-generated invoice numbers
* Print/email invoice
* Store info included

## **5.6.3 Invoice Modification & Cancellation**

* Cancel within 24 hours
* Credit note generation
* Partial refunds
* Inventory adjustments

## **5.6.4 Payment Processing**

* Multi-payment support
* On-account payments
* Reconciliation reports

---

# **5.7 Customer Management**

*(Previously 5.6 — renumbered to 5.7)*

## **5.7.1 Customer Profile**

* Basic profile fields
* Link prescriptions & invoices
* Loyalty tiers

## **5.7.2 Customer Interaction Tracking**

* Sales rep notes
* Activity history
* Contact logs

## **5.7.3 Engagement**

* Refill reminders
* Personalized offers
* Notifications

---

# **5.8 Reporting & Analytics**

*(Previously 5.7 — renumbered to 5.8)*

## **5.8.1 Sales Reports**

* Daily/weekly/monthly sales
* Revenue breakdown
* Sales by medicine, store, customer

## **5.8.2 Inventory Reports**

* Stock levels
* Expiry alerts
* Inventory turnover

## **5.8.3 Financial Reports**

* GST summary
* Profit & loss
* Discount impact

## **5.8.4 Performance Reports**

* Sales rep performance
* Pharmacist productivity
* Retention metrics

## **5.8.5 Compliance Reports**

* Audit logs
* Cancelled invoices
* User access logs

---

# ✅ **PART 2 Completed.**



# **PART 3 — Updated Sections 6–13 (User Journeys, Wireframes, NFRs, Roadmap, Acceptance Criteria)**


---

# **6. USER JOURNEYS & WORKFLOWS (UPDATED)**

This section now incorporates the new **Appointment Management flows** into the journeys of Doctors, Customers, and Pharmacist/Reception roles.

---

# **6.1 Administrator Journey**

**Primary Objectives:**
System setup, user management, compliance, store configuration.

### Steps:

1. **Login** → Access Admin Dashboard
2. **User Management** → Add/edit roles, activation, store assignment
3. **System Configuration** → GST rates, thresholds, discount rules
4. **Store Management** → Add stores, assign users, manage inventory rules
5. **Appointment Oversight**

   * View all appointments
   * Override/cancel/reschedule as needed
6. **Catalog Management** → Manage medicines, pricing, variants
7. **Reporting & Compliance** → GST, audit logs, user access patterns

---

# **6.2 Pharmacist / Receptionist Journey (UPDATED)**

**Primary Objectives:**
Fulfill prescriptions, perform POS billing, manage appointments.

### Steps:

### **1. Login**

* Access store-level dashboard

### **2. Appointment Handling**

* Create new appointments for walk-in patients
* View today’s appointments for all doctors
* Check-in patients
* Reschedule or cancel (with reasons)

### **3. Prescription Fulfillment**

* Search prescription
* Validate stock
* Fulfill items and notify customer

### **4. Point of Sale**

* Add items by barcode/search
* Apply discounts
* Process payments
* Print/email invoice

### **5. Inventory Management**

* Review low stock
* Mark expired/damaged stock
* Perform stock adjustments

### **6. End-of-Day Reporting**

* View transactions, cash reconciliation, inventory changes

---

# **6.3 Doctor Journey (UPDATED)**

**Primary Objectives:**
Manage appointments, conduct consultations, create prescriptions, view patient history.

### Steps:

### **1. Login**

* Access Doctor Dashboard showing:

  * Today’s appointments
  * Upcoming schedule
  * Quick actions (Mark Completed, View Patient History)

### **2. Appointment Management**

* Review daily schedule
* Mark appointment as Completed / No-show
* Update availability schedule
* Block/unblock time slots

### **3. Patient Consultation**

* Access patient history
* View previous prescriptions
* Add notes for appointment

### **4. Create Prescription**

* Select patient
* Add medicines, dosage, instructions
* Save and finalize prescription

### **5. Track Prescription Fulfillment**

* See fulfillment progress
* Follow-up reminders

---

# **6.4 Sales Rep Journey**

**Primary Objectives:**
Track customer interactions, record visits, analyze sales performance.

### Steps:

1. Login → Sales Dashboard
2. View assigned customers
3. Log interactions (visit notes, discussions, outcomes)
4. Track sales performance metrics
5. Generate personal reports

---

# **6.5 Customer Journey (UPDATED)**

**Primary Objectives:**
Book appointments, purchase medicines, track prescriptions & orders.

### Steps:

### **1. Registration/Login**

* Create profile
* Update personal details

### **2. Book Appointment**

* Select doctor
* Choose timeslot based on availability
* Confirm booking
* Receive reminder notifications

### **3. Reschedule/Cancel Appointment**

* View upcoming appointments
* Change or cancel with reason

### **4. Prescription Access**

* View prescriptions created by doctor
* Request refills

### **5. Purchase Medicines**

* Browse medicines
* Add to cart
* Checkout via POS or online (if available)

### **6. Order Tracking**

* View past orders
* Download invoice copies

---

# **7. SCREEN LAYOUTS & WIREFRAMES (UPDATED)**

All screen layouts remain as in the original BRD **with the addition of three new screens**:

---

## **7.16 Appointment Booking Screen (Customer/Receptionist)**

```
Select Doctor: [Dr. A Patel ▼]
Date: [12-Dec-2025 ▼]

Available Slots:
[10:00 AM] [10:15 AM] [10:30 AM] [11:00 AM] [11:15 AM]
[2:00 PM] [2:15 PM] [2:30 PM] [3:00 PM]

Notes: [____________________________]

[Cancel]   [Confirm Appointment]
```

---

## **7.17 Appointment Dashboard (Doctor View)**

```
Today's Appointments — Dr. A. Patel
----------------------------------------------
10:00 | Rajesh Kumar  | Scheduled  | [Start] [Cancel]
10:15 | Priya Singh   | Checked-In | [Start]
10:30 | Amit Verma    | Completed  | [Notes]
----------------------------------------------
[View Full Schedule] [Block Time] [Edit Availability]
```

---

## **7.18 Monitor Display View (Waiting Area)**

```
------------------------------------------
     DOCTOR APPOINTMENT DISPLAY - TODAY
------------------------------------------
10:00 AM | Rajesh K.  | Dr. A. Patel | Scheduled
10:15 AM | Priya S.   | Dr. A. Patel | Checked-In
10:30 AM | Amit V.    | Dr. P. Nair  | Completed
------------------------------------------
Auto-refreshing every 30 seconds
```

---

# **8. NON-FUNCTIONAL REQUIREMENTS**

No structural changes but updated to reflect appointment module dependencies.

---

## **8.1 Performance**

* Appointment list refresh ≤ 2 seconds
* POS transactions < 3 seconds
* API response time < 1 second

## **8.2 Security**

* Encrypt appointment/patient data in transit & rest
* Role-based access to appointment details
* Audit logs for appointment changes

## **8.3 Scalability**

* Support 100+ concurrent appointment viewers
* Horizontal scaling for real-time display

## **8.4 Reliability**

* Appointment data synced across devices in real-time
* Failover for POS & appointment dashboards

## **8.5 Usability**

* WCAG 2.1 accessibility compliance
* Appointment display readable on large screens

## **8.6 Compliance**

* Handles PHI securely (HIPAA-driven best practices)
* Audit logs retained for 2+ years

---

# **9. TECHNOLOGY STACK (UNCHANGED)**

Minor note added:

* Appointment scheduling requires **cron or event scheduler** (e.g., Node scheduler, AWS EventBridge) for reminders.

---

# **10. IMPLEMENTATION ROADMAP (UPDATED)**

## **Phase 1 (Months 1–3): MVP**

* User management
* Basic catalog
* POS
* Basic reporting
* **Appointment module (core only)**

  * Create appointment
  * Doctor view
  * Customer view
  * No notifications yet

## **Phase 2 (Months 4–6): Enhancements**

* Prescription workflow
* Advanced inventory
* Multi-store
* **Appointment Enhancements**

  * Monitor display
  * Schedule management
  * Notifications (email/SMS)

## **Phase 3 (Months 7–9): Optimization**

* Advanced analytics
* AI-based forecasting
* Telemedicine (optional)

---

# **11. SUCCESS METRICS (UPDATED)**

| KPI                                     | Target                      |
| --------------------------------------- | --------------------------- |
| Appointment Booking Accuracy            | 99% (no double bookings)    |
| Doctor Schedule Utilization             | ≥ 85%                       |
| Patient No-Show Rate                    | Reduce by 20% via reminders |
| End-to-End Appointment Workflow Success | ≥ 95%                       |
| POS Transaction Speed                   | < 3 seconds                 |
| Stock Accuracy                          | ≥ 99%                       |

---

# **12. ASSUMPTIONS & CONSTRAINTS (UPDATED)**

### Assumptions

* Doctors share accurate availability
* Pharmacy provides device for monitor display
* Internet available during appointments

### Constraints

* SMS/Email reminders depend on provider uptime
* Appointment conflicts must be prevented programmatically
* Multi-location availability (Phase 2 requirement)

---

# **13. ACCEPTANCE CRITERIA (UPDATED)**

To accept the system:

### **Appointment Module**

* Users can create, update, cancel, and view appointments
* No double-booking unless explicitly configured
* Schedule changes reflect instantly everywhere
* Appointment display refreshes automatically
* Notifications trigger correctly (Phase 2)

### **Overall System**

* All major use cases validated in UAT
* 95%+ test coverage
* GST invoices must pass compliance audit
* Load test: 100 concurrent users with stable performance
* No P1 or P2 issues open at go-live


