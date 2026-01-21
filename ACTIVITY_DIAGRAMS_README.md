# Activity Diagrams - PlantUML

This folder contains PlantUML activity diagrams for the Tailoring Management System showing the workflows and processes.

## Files Available

### 1. `activity_diagram_order_placement.puml`
- **Order Placement Workflow**
- Shows customer placing an order
- Includes fabric selection, payment, and order creation
- Best for understanding customer order flow

### 2. `activity_diagram_order_processing.puml`
- **Order Processing Workflow**
- Shows admin assignment and tailor work process
- Includes cutting, stitching, trial, and completion
- Best for understanding production workflow

### 3. `activity_diagram_appointment_booking.puml`
- **Appointment Booking Workflow**
- Shows appointment request, approval, and completion
- Includes order creation from appointment
- Best for understanding appointment process

### 4. `activity_diagram_payment_processing.puml`
- **Payment Processing Workflow**
- Shows bill viewing, payment, and status updates
- Includes payment gateway integration
- Best for understanding payment flow

### 5. `activity_diagram_complete_system.puml`
- **Complete System Workflow**
- Shows end-to-end process from registration to delivery
- Organized in partitions by major phases
- Best for system overview

### 6. `activity_diagram_fabric_management.puml`
- **Fabric Management Workflow**
- Shows adding fabric, updating stock, and order usage
- Includes low stock alerts
- Best for understanding inventory management

## Workflows Covered

### 1. Order Placement
- Customer login
- Fabric browsing and selection
- Measurement entry
- Payment processing
- Order creation
- Stock management

### 2. Order Processing
- Admin assignment
- Tailor acceptance
- Work stages (Cutting, Stitching)
- Trial process
- Order completion
- Notifications

### 3. Appointment Booking
- Appointment request
- Admin approval
- Appointment scheduling
- Appointment completion
- Order creation from appointment

### 4. Payment Processing
- Bill viewing
- Payment gateway integration
- Payment status updates
- Partial vs full payment
- Payment confirmations

### 5. Fabric Management
- Adding new fabrics
- Stock updates
- Low stock alerts
- Stock reservation for orders

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
java -jar plantuml.jar activity_diagram_order_placement.puml

# Generate SVG
java -jar plantuml.jar -tsvg activity_diagram_order_placement.puml
```

## Recommended for Project Report

Use **`activity_diagram_complete_system.puml`** for overall system workflow, or use individual diagrams for specific processes:
- **Order Placement** - Customer perspective
- **Order Processing** - Production workflow
- **Payment Processing** - Financial transactions
- **Appointment Booking** - Service scheduling

## Key Features

✅ **Decision Points** - Shows if/else conditions  
✅ **Parallel Activities** - Shows concurrent processes  
✅ **Partitions** - Groups related activities  
✅ **Swimlanes** - Shows actor responsibilities  
✅ **Black & White** - Print-friendly formatting  

## Activity Diagram Elements

- **Start/Stop** - Beginning and end of process
- **Activities** - Actions performed
- **Decisions** - Conditional branches (if/else)
- **Partitions** - Grouped activities by phase/actor
- **Arrows** - Flow direction

All diagrams are formatted in black and white for easy printing and inclusion in project reports.


