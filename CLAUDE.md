# Claude Project Rules

This project follows the **AI Driven Development Lifecycle (AIDLC)**.

The workflow definition is located at:

@aidlc-rules/aws-aidlc-rules/core-workflow.md


---

# AIDLC Workflow Initialization

Before performing ANY task, the AI MUST perform the following initialization:

1. Read the workflow state file:

aidlc-docs/aidlc-state.md

2. Identify the current workflow position:

- Current Phase
- Current Stage
- Completed Stages
- Pending Stages

3. Determine the next valid action according to:

aidlc-rules/aws-aidlc-rules/core-workflow.md

4. Load rule detail files required for the current stage from:

.aidlc-rule-details/


Never assume the workflow stage without reading the state file.

The **workflow state file is the single source of truth** for the current development stage.


---

# Workflow State Authority

The authoritative workflow state is stored in:

aidlc-docs/aidlc-state.md

The AI MUST:

- Read this file before starting work
- Use it to determine the current workflow stage
- Update it when a stage is completed

If the state file is inconsistent with the artifacts present in `aidlc-docs`, the AI must request clarification from the user.


---

# Workflow Discipline

The AI must strictly follow the AIDLC stage order.

Stages MUST NOT be skipped.

Typical workflow sequence:

Workspace Detection  
Reverse Engineering (if brownfield)  
Requirements Analysis  
User Stories  
Workflow Planning  
Application Design  
Units Generation  
Functional Design  
NFR Requirements  
NFR Design  
Infrastructure Design  
Code Generation  
Build and Test


---

# Stage Restrictions

The AI must respect stage responsibilities.

## Design Stages

During the following stages:

- Requirements Analysis
- User Stories
- Workflow Planning
- Application Design
- Functional Design
- NFR Requirements
- NFR Design
- Infrastructure Design

The AI MUST:

- Produce design artifacts only
- Write documentation in `aidlc-docs/`
- NOT generate implementation code

Only documentation and planning artifacts are allowed.


---

# Code Generation Restriction

Implementation code may ONLY be generated during the stage:

Code Generation

If the AI is not in the **Code Generation stage**, it MUST NOT create or modify application source code.


---

# Rule Files

Rule files are located in:

.aidlc-rule-details/

These include:

- common rules
- inception rules
- construction rules
- extension rules

At workflow start, the AI MUST load:

common/process-overview.md  
common/session-continuity.md  
common/content-validation.md  
common/question-format-guide.md


Extensions located in:

extensions/

must be enforced if enabled in:

aidlc-docs/aidlc-state.md


---

# Workflow Artifacts

All workflow artifacts are stored in:

aidlc-docs/

Typical structure:

aidlc-docs/
- aidlc-state.md
- audit.md
- inception/
- construction/
- operations/


Application source code must NEVER be written inside `aidlc-docs`.


---

# State Update Requirement

After completing any workflow stage, the AI MUST:

1. Update:

aidlc-docs/aidlc-state.md

2. Log the interaction in:

aidlc-docs/audit.md

3. Record:

- timestamp
- user input
- AI response
- workflow context


---

# Audit Log Policy

All interactions MUST be recorded in:

aidlc-docs/audit.md

Requirements:

- Capture COMPLETE RAW USER INPUT
- Do NOT summarize user prompts
- Append entries only
- Never overwrite the file

Timestamps must follow ISO 8601 format.


---

# Content Validation

Before writing ANY documentation artifact, the AI must validate content according to:

common/content-validation.md

This includes:

- Mermaid diagram validation
- ASCII diagram validation
- Markdown compatibility
- Proper escaping of special characters


---

# Question Format Rules

When asking the user questions, the AI MUST follow:

common/question-format-guide.md

Rules include:

- Multiple choice format
- Clear option labeling
- Required `[Answer]:` tag
- Validation of user responses


---

# Session Continuity

When a new session starts, the AI MUST resume the workflow by:

1. Reading:

aidlc-docs/aidlc-state.md

2. Determining the last completed stage

3. Continuing from the next stage defined by the workflow


---

# Safety Rule

If the workflow state is unclear or inconsistent, the AI MUST stop and ask the user for clarification before continuing.


---

# Summary

This repository uses **AIDLC specification-driven development**.

The AI must:

- follow the defined workflow
- respect stage responsibilities
- update workflow state
- log all interactions
- generate code only during Code Generation stage