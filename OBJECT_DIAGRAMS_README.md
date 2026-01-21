# Object Diagrams - PlantUML

This folder contains PlantUML object diagrams for the Tailoring Management System showing object instances and their relationships at a specific point in time.

## Files Available

### 1. `object_diagram_order_instance.puml`
- **Order Instance with Related Objects**
- Shows a single order with customer, tailor, fabric, bill, and measurements
- Best for understanding order structure and relationships
- Includes real object attributes

### 2. `object_diagram_customer_instance.puml`
- **Customer Instance with Related Objects**
- Shows customer with user account, orders, appointments, and measurement history
- Best for understanding customer data structure
- Shows one-to-many relationships

### 3. `object_diagram_complete_system.puml`
- **Complete System Object Diagram**
- Shows multiple instances of all main entities
- Organized in packages (Users, Orders, Bills, Fabrics, Appointments)
- Best for system overview

### 4. `object_diagram_order_workflow.puml`
- **Order Workflow Through States**
- Shows same order in different states (Pending → Cutting → Stitching → Ready → Delivered)
- Best for understanding order lifecycle
- Shows state transitions

### 5. `object_diagram_relationships.puml`
- **Entity Relationships Diagram**
- Shows all main entities and their relationships
- Includes cardinality (1:1, 1:N, N:1)
- Best for understanding database relationships

## Object Instances Shown

### Order Object
- Order ID, order number, status
- Total amount, dates
- References to customer, tailor, fabric, bill

### Customer Object
- Customer ID, name, contact info
- Current measurements
- References to orders, appointments, history

### User Object
- User ID, name, email, role
- Account status
- Can be Customer, Admin, Tailor, or Staff

### Bill Object
- Bill number, amount, status
- Payment information
- Reference to order

### Fabric Object
- Fabric details, stock, price
- Active status
- Created by admin

### Appointment Object
- Service type, status, schedule
- Reference to customer and order

## Relationships Demonstrated

1. **User ↔ Customer**: One-to-One (optional)
2. **Customer → Orders**: One-to-Many
3. **User (Tailor) → Orders**: One-to-Many
4. **Order → Bill**: One-to-One
5. **Order → Fabric**: Many-to-One
6. **Customer → Appointments**: One-to-Many
7. **Customer → MeasurementHistory**: One-to-Many
8. **Order → Notifications**: One-to-Many

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
java -jar plantuml.jar object_diagram_order_instance.puml

# Generate SVG
java -jar plantuml.jar -tsvg object_diagram_order_instance.puml
```

## Recommended for Project Report

Use **`object_diagram_complete_system.puml`** for overall system structure, or:
- **`object_diagram_order_instance.puml`** - For order details
- **`object_diagram_relationships.puml`** - For entity relationships
- **`object_diagram_order_workflow.puml`** - For order lifecycle

## Key Features

✅ **Object Instances** - Shows actual object data  
✅ **Relationships** - Shows links between objects  
✅ **Attributes** - Shows object properties  
✅ **Cardinality** - Shows relationship types  
✅ **Black & White** - Print-friendly formatting  

## Object Diagram Elements

- **Objects** - Instances of classes with attributes
- **Links** - Relationships between objects
- **Attributes** - Object properties and values
- **Notes** - Additional information
- **Packages** - Grouped related objects

All diagrams are formatted in black and white for easy printing and inclusion in project reports.


