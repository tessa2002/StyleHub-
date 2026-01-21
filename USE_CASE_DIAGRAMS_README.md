# Use Case Diagrams - PlantUML

This folder contains PlantUML use case diagrams for the Tailoring Management System.

## Files Available

### 1. `use_case_diagram_complete.puml` (Recommended)
- **Most comprehensive version** with all 72 use cases
- Organized by functional packages
- Shows all relationships (extend/include)
- Best for detailed documentation and project reports
- Includes all actors: Customer, Admin, Staff, Tailor

### 2. `use_case_diagram_simple.puml`
- **Simplified version** with grouped use cases
- Easier to read and understand
- Good for presentations and overview
- Shows main functionalities per actor

### 3. `use_case_diagram_by_actor.puml`
- **Separated by actor** - each actor has their own section
- Best for understanding individual actor responsibilities
- Clear separation of concerns
- Good for role-based documentation

## Actors in the System

1. **Customer**
   - End users who place orders
   - Can manage profile, measurements, orders, appointments
   - Can make payments and view bills

2. **Admin**
   - Full system access
   - Manages users, customers, orders, fabrics
   - Handles appointments, billing, and analytics
   - Generates reports

3. **Staff**
   - Assists customers
   - Creates and updates orders
   - Manages customers and measurements
   - Approves appointments

4. **Tailor**
   - Works on assigned orders
   - Updates order stages
   - Views customer measurements
   - Manages order workflow

## Main Use Case Categories

### Customer Use Cases (21 use cases)
- Authentication & Profile Management
- Measurement Management
- Order Management
- Appointment Booking
- Payment & Billing
- Fabric Catalog Browsing
- Notifications

### Admin Use Cases (30 use cases)
- User Management
- Customer Management
- Order Management
- Fabric Inventory Management
- Appointment Management
- Billing & Payments
- Dashboard & Analytics

### Staff Use Cases (10 use cases)
- Order Management
- Customer Management
- Appointment Approval

### Tailor Use Cases (10 use cases)
- Order Workflow Management
- Customer Information Access
- Notifications

## How to Use

### Option 1: Online (Easiest)
1. Go to http://www.plantuml.com/plantuml/uml/
2. Copy and paste the content from any `.puml` file
3. The diagram will be generated automatically
4. Export as PNG/SVG

### Option 2: VS Code Extension
1. Install "PlantUML" extension in VS Code
2. Open any `.puml` file
3. Press `Alt + D` to preview the diagram
4. Export as PNG/SVG using the extension

### Option 3: Command Line
```bash
# Install PlantUML (requires Java)
# Download from: http://plantuml.com/download

# Generate PNG
java -jar plantuml.jar use_case_diagram_complete.puml

# Generate SVG
java -jar plantuml.jar -tsvg use_case_diagram_complete.puml
```

## Recommended for Project Report

Use **`use_case_diagram_complete.puml`** as it:
- ✅ Shows all use cases comprehensively
- ✅ Organized by functional packages
- ✅ Shows relationships (extend/include)
- ✅ Professional appearance
- ✅ Complete system overview

## Diagram Relationships

### Extend Relationship
- Used when a use case extends another use case
- Example: "Place Order" extends "Book Appointment" (optional flow)

### Include Relationship
- Used when a use case must include another use case
- Example: "Create Order" includes "View Customer Details" (mandatory)

## Use Case Summary

| Actor | Number of Use Cases |
|-------|-------------------|
| Customer | 21 |
| Admin | 30 |
| Staff | 10 |
| Tailor | 10 |
| **Total** | **71** |

## Key Features Covered

✅ User Authentication & Authorization  
✅ Customer Profile & Measurement Management  
✅ Order Placement & Tracking  
✅ Appointment Booking & Management  
✅ Fabric Inventory Management  
✅ Billing & Payment Processing  
✅ Order Assignment & Workflow  
✅ Notification System  
✅ Dashboard & Analytics  
✅ Report Generation  


