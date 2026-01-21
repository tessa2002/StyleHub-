# PlantUML Database Diagrams

This folder contains PlantUML code for generating UML class diagrams based on your database schema.

## Files Available

### 1. `database_uml_complete.puml` (Recommended)
- **Most detailed version** with all constraints and annotations
- Includes notes explaining ENUM values
- Best for documentation and project reports
- Shows all NOT NULL, UNIQUE, and ENUM constraints

### 2. `database_uml_diagram.puml`
- Standard class diagram with all fields
- Includes all constraints in field definitions
- Good for general use

### 3. `database_uml_simple.puml`
- Simplified version with essential fields only
- Cleaner look, easier to read
- Good for presentations

### 4. `database_uml_erd.puml`
- Entity-Relationship Diagram style
- Uses table notation with colored foreign keys
- Good for database-focused documentation

## How to Use

### Option 1: Online (Easiest)
1. Go to http://www.plantuml.com/plantuml/uml/
2. Copy and paste the content from any `.puml` file
3. The diagram will be generated automatically

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
java -jar plantuml.jar database_uml_complete.puml

# Generate SVG
java -jar plantuml.jar -tsvg database_uml_complete.puml
```

### Option 4: Online Editors
- **PlantText**: https://www.planttext.com/
- **PlantUML Web Server**: http://www.plantuml.com/plantuml/uml/

## Recommended for Project Report

Use **`database_uml_complete.puml`** as it:
- ✅ Matches your exact table structure
- ✅ Shows all constraints clearly
- ✅ Includes relationship cardinality
- ✅ Has explanatory notes
- ✅ Professional appearance

## Diagram Features

All diagrams include:
- ✅ 8 main tables (Users, Customers, Orders, Fabrics, Bills, Appointments, MeasurementHistory, Notifications)
- ✅ Primary Keys (PK) marked
- ✅ Foreign Keys (FK) with relationships
- ✅ Data types for all fields
- ✅ Constraints (NOT NULL, UNIQUE, ENUM)
- ✅ Relationship lines with cardinality
- ✅ Timestamps (createdAt, updatedAt)

## Relationships Shown

- Users ↔ Customers (One-to-One, optional)
- Customers → Orders (One-to-Many)
- Users → Orders (One-to-Many, as assignedTailor)
- Orders → Bills (One-to-One)
- Customers → Appointments (One-to-Many)
- Customers → MeasurementHistory (One-to-Many)
- Orders → Fabrics (Many-to-One)
- Users → Notifications (One-to-Many)
- Orders → Notifications (One-to-Many)


