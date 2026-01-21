# Database Tables Schema

## Table 1: Users

| No. | Field | Data Type | Key Constraints | Description |
|-----|-------|-----------|-----------------|-------------|
| 1 | _id | ObjectId | PRIMARY KEY | Unique identifier |
| 2 | name | String | NOT NULL | User full name |
| 3 | email | String | UNIQUE, NOT NULL | Email address |
| 4 | password | String | NOT NULL | Encrypted password |
| 5 | role | String | NOT NULL, ENUM | Role: Customer, Admin, Tailor, Staff |
| 6 | status | String | ENUM | Status: Active, Suspended, Pending |
| 7 | phone | String | - | Contact number |
| 8 | address | String | - | User address |
| 9 | gender | String | ENUM | Gender preference |
| 10 | createdAt, updatedAt | Date | - | Timestamps |

---

## Table 2: Customers

| No. | Field | Data Type | Key Constraints | Description |
|-----|-------|-----------|-----------------|-------------|
| 1 | _id | ObjectId | PRIMARY KEY | Unique identifier |
| 2 | user | ObjectId | FOREIGN KEY (Users), UNIQUE | Linked user account |
| 3 | name | String | NOT NULL | Customer name |
| 4 | phone | String | UNIQUE, NOT NULL | Contact phone |
| 5 | email | String | - | Email address |
| 6 | address | String | - | Customer address |
| 7 | measurements | Object | - | Body measurements (height, chest, waist, hips, etc.) |
| 8 | notes | String | - | Customer notes |
| 9 | styleNotes | String | - | Style preferences |
| 10 | createdAt, updatedAt | Date | - | Timestamps |

---

## Table 3: Orders

| No. | Field | Data Type | Key Constraints | Description |
|-----|-------|-----------|-----------------|-------------|
| 1 | _id | ObjectId | PRIMARY KEY | Unique identifier |
| 2 | customer | ObjectId | FOREIGN KEY (Customers), NOT NULL | Customer reference |
| 3 | items | Array | - | Order items (name, quantity, price) |
| 4 | status | String | ENUM, NOT NULL | Status: Pending, Cutting, Stitching, Ready, Delivered |
| 5 | totalAmount | Number | NOT NULL | Total order amount |
| 6 | measurementSnapshot | Object | - | Measurements at order time |
| 7 | assignedTailor | ObjectId | FOREIGN KEY (Users) | Assigned tailor |
| 8 | fabric | Object | - | Fabric details (source, quantity, cost) |
| 9 | customizations | Object | - | Embroidery and customization options |
| 10 | orderDate | Date | - | Order placement date |
| 11 | expectedDelivery | Date | - | Expected delivery date |
| 12 | stage | String | ENUM | Production stage |
| 13 | notes | String | - | Order notes |
| 14 | createdAt, updatedAt | Date | - | Timestamps |

---

## Table 4: Fabrics

| No. | Field | Data Type | Key Constraints | Description |
|-----|-------|-----------|-----------------|-------------|
| 1 | _id | ObjectId | PRIMARY KEY | Unique identifier |
| 2 | name | String | NOT NULL | Fabric name |
| 3 | material | String | NOT NULL | Material type |
| 4 | color | String | NOT NULL | Fabric color |
| 5 | price | Number | NOT NULL, MIN(0) | Price per unit |
| 6 | stock | Number | NOT NULL, MIN(0) | Available stock |
| 7 | category | String | NOT NULL, ENUM | Category: cotton, silk, linen, etc. |
| 8 | description | String | - | Fabric description |
| 9 | images | Array | - | Fabric images |
| 10 | isActive | Boolean | - | Availability status |
| 11 | createdBy | ObjectId | FOREIGN KEY (Users) | Creator reference |
| 12 | createdAt, updatedAt | Date | - | Timestamps |

---

## Table 5: Bills

| No. | Field | Data Type | Key Constraints | Description |
|-----|-------|-----------|-----------------|-------------|
| 1 | _id | ObjectId | PRIMARY KEY | Unique identifier |
| 2 | billNumber | String | UNIQUE, AUTO-GENERATED | Bill number |
| 3 | order | ObjectId | FOREIGN KEY (Orders), UNIQUE, NOT NULL | Order reference |
| 4 | customer | ObjectId | FOREIGN KEY (Customers) | Customer reference |
| 5 | amount | Number | NOT NULL | Total bill amount |
| 6 | amountPaid | Number | - | Amount paid |
| 7 | paymentMethod | String | - | Payment method |
| 8 | status | String | ENUM, NOT NULL | Status: Unpaid, Partial, Paid |
| 9 | payments | Array | - | Payment records |
| 10 | createdAt, updatedAt | Date | - | Timestamps |

---

## Table 6: Appointments

| No. | Field | Data Type | Key Constraints | Description |
|-----|-------|-----------|-----------------|-------------|
| 1 | _id | ObjectId | PRIMARY KEY | Unique identifier |
| 2 | customer | ObjectId | FOREIGN KEY (Customers), NOT NULL | Customer reference |
| 3 | service | String | NOT NULL | Service type |
| 4 | scheduledAt | Date | NOT NULL | Appointment date/time |
| 5 | status | String | ENUM, NOT NULL | Status: Pending, Scheduled, Completed |
| 6 | approved | Boolean | - | Approval status |
| 7 | approvedBy | ObjectId | FOREIGN KEY (Users) | Approver reference |
| 8 | relatedOrder | ObjectId | FOREIGN KEY (Orders) | Related order |
| 9 | createdAt, updatedAt | Date | - | Timestamps |

---

## Table 7: MeasurementHistory

| No. | Field | Data Type | Key Constraints | Description |
|-----|-------|-----------|-----------------|-------------|
| 1 | _id | ObjectId | PRIMARY KEY | Unique identifier |
| 2 | customer | ObjectId | FOREIGN KEY (Customers), NOT NULL | Customer reference |
| 3 | measurements | Object | - | Body measurements (height, chest, waist, etc.) |
| 4 | styleNotes | String | - | Style notes |
| 5 | source | String | ENUM, NOT NULL | Source: manual, order |
| 6 | createdAt, updatedAt | Date | - | Timestamps |

---

## Table 8: Notifications

| No. | Field | Data Type | Key Constraints | Description |
|-----|-------|-----------|-----------------|-------------|
| 1 | _id | ObjectId | PRIMARY KEY | Unique identifier |
| 2 | recipientId | ObjectId | FOREIGN KEY (Users), NOT NULL | Recipient user |
| 3 | message | String | NOT NULL | Notification message |
| 4 | type | String | ENUM, NOT NULL | Type: info, warning, success, error |
| 5 | priority | String | ENUM, NOT NULL | Priority: low, medium, high, urgent |
| 6 | relatedOrder | ObjectId | FOREIGN KEY (Orders) | Related order |
| 7 | isRead | Boolean | - | Read status |
| 8 | createdAt, updatedAt | Date | - | Timestamps |

---

## Relationships Summary

- **Users** ↔ **Customers**: One-to-One (optional)
- **Customers** → **Orders**: One-to-Many
- **Users** → **Orders**: One-to-Many (as assignedTailor)
- **Orders** → **Bills**: One-to-One
- **Customers** → **Appointments**: One-to-Many
- **Customers** → **MeasurementHistory**: One-to-Many
- **Orders** → **Fabrics**: Many-to-One
- **Users** → **Notifications**: One-to-Many

