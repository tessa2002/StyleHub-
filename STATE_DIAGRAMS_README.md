# State Diagrams - PlantUML

This folder contains PlantUML state diagrams for the Tailoring Management System showing the state transitions of various entities.

## Files Available

### 1. `state_diagram_combined.puml` (Recommended)
- **Combined state diagram** showing all entities in one view
- Shows relationships between different state machines
- Best for system overview and project reports
- Includes: Orders, Appointments, Bills, Users, Fabrics

### 2. `state_diagram_complete_system.puml`
- **Most detailed version** with nested states
- Shows internal states within each main state
- Comprehensive documentation with notes
- Best for detailed analysis

### 3. `state_diagram_unified.puml`
- **Unified view** with all state machines in one system
- Shows cross-system relationships clearly
- Clean and organized layout
- Good for presentations

### 4. Individual State Diagrams
- `state_diagram_order.puml` - Order lifecycle
- `state_diagram_appointment.puml` - Appointment flow
- `state_diagram_bill_payment.puml` - Payment states
- `state_diagram_user_account.puml` - User account states
- `state_diagram_fabric_stock.puml` - Fabric inventory states

## State Machines Covered

### 1. Order States
- **Order Placed** → **Pending** → **Cutting** → **Stitching** → **Trial** (optional) → **Ready** → **Delivered**
- Can be **Cancelled** at any stage
- May require **Pending Appointment** before processing

### 2. Appointment States
- **Pending** → **Scheduled** → **Completed**
- Can be **Cancelled** at any stage

### 3. Bill/Payment States
- **Unpaid** → **Partial** → **Paid**
- Can go directly from **Unpaid** to **Paid**

### 4. User Account States
- **Pending** → **Active** ↔ **Suspended**
- **Active** users can be suspended and reactivated

### 5. Fabric Stock States
- **In Stock** → **Low Stock** → **Out of Stock**
- Can be **Inactive** at any time
- Can be replenished from **Low Stock** or **Out of Stock**

## State Transitions

### Order State Transitions
```
Order Placed → Pending (order created)
Pending → Pending Appointment (appointment needed)
Pending Appointment → Pending (appointment completed)
Pending → Cutting (assigned to tailor)
Cutting → Stitching (cutting completed)
Stitching → Trial (if trial needed)
Trial → Stitching (changes needed)
Trial → Ready (approved)
Stitching → Ready (direct completion)
Ready → Delivered (customer collects)
Any state → Cancelled (cancellation)
```

### Appointment State Transitions
```
Pending → Scheduled (admin approves)
Pending → Cancelled (rejected)
Scheduled → Completed (appointment done)
Scheduled → Cancelled (cancelled)
```

### Bill State Transitions
```
Unpaid → Partial (partial payment)
Unpaid → Paid (full payment)
Partial → Paid (remaining paid)
```

### User Account State Transitions
```
Pending → Active (account activated)
Active → Suspended (admin action)
Suspended → Active (reactivated)
```

### Fabric Stock State Transitions
```
In Stock → Low Stock (stock <= threshold)
Low Stock → Out of Stock (depleted)
Low Stock → In Stock (replenished)
Out of Stock → In Stock (replenished)
Any state → Inactive (deactivated)
Inactive → In Stock (reactivated)
```

## Relationships Between States

1. **Order → Bill**: When order is placed, a bill is created
2. **Order → Appointment**: Some orders require appointments
3. **Order → Fabric Stock**: Orders check fabric availability
4. **Order → User Account**: Orders need active tailor (user)
5. **Appointment → Order**: Completed appointments can create orders

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
java -jar plantuml.jar state_diagram_combined.puml

# Generate SVG
java -jar plantuml.jar -tsvg state_diagram_combined.puml
```

## Recommended for Project Report

Use **`state_diagram_combined.puml`** or **`state_diagram_complete_system.puml`** as they:
- ✅ Show all state machines in one view
- ✅ Display relationships between states
- ✅ Include explanatory notes
- ✅ Professional appearance
- ✅ Complete system overview

## Key Features

✅ **Order Lifecycle Management** - Complete order processing workflow  
✅ **Appointment Scheduling** - Appointment request and approval flow  
✅ **Payment Processing** - Bill creation and payment states  
✅ **User Management** - Account activation and suspension  
✅ **Inventory Management** - Fabric stock level tracking  
✅ **State Relationships** - Shows how different entities interact  

## State Summary

| Entity | Number of States | Key States |
|--------|-----------------|------------|
| Order | 8 | Placed, Pending, Cutting, Stitching, Ready, Delivered, Cancelled |
| Appointment | 4 | Pending, Scheduled, Completed, Cancelled |
| Bill | 3 | Unpaid, Partial, Paid |
| User Account | 3 | Pending, Active, Suspended |
| Fabric Stock | 4 | In Stock, Low Stock, Out of Stock, Inactive |


