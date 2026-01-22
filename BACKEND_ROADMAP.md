# Backend Development Roadmap - Supabase Implementation

## Overview
This document outlines the phased approach to building the backend for your Partner project using Supabase (PostgreSQL + Auth + Storage + Edge Functions).

**Total Tables Required: ~45-50 tables**

---

## Phase 1: Foundation & Authentication (Week 1-2)
**Priority: CRITICAL** - Required for all other features

### Tables to Create:

#### 1. `users` (extends Supabase auth.users)
```sql
- id (uuid, PK, references auth.users)
- email (text, unique)
- first_name (text)
- last_name (text)
- full_name (text, generated)
- role (text: 'admin', 'manager', 'employee', 'subcontractor')
- phone (text)
- avatar_url (text)
- current_business_id (uuid, FK to businesses)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 2. `businesses`
```sql
- id (uuid, PK)
- name (text)
- business_type (text)
- tax_id (text)
- address (text)
- city (text)
- state (text)
- zip_code (text)
- phone (text)
- email (text)
- website (text)
- logo_url (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 3. `user_businesses` (Many-to-Many)
```sql
- id (uuid, PK)
- user_id (uuid, FK to users)
- business_id (uuid, FK to businesses)
- role (text: 'owner', 'admin', 'manager', 'employee')
- permissions (jsonb)
- is_active (boolean)
- joined_at (timestamptz)
- created_at (timestamptz)
```

#### 4. `business_settings`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses, unique)
- accreditation_expiry_notice_days (integer, default: 90)
- invoice_prefix (text)
- estimate_prefix (text)
- tax_rate (decimal)
- currency (text, default: 'USD')
- timezone (text)
- settings (jsonb) -- flexible settings storage
- created_at (timestamptz)
- updated_at (timestamptz)
```

### Supabase Setup:
- Enable Email Auth
- Configure RLS (Row Level Security) policies
- Set up user profiles trigger
- Create business creation function

---

## Phase 2: Core CRM (Week 3-4)
**Priority: HIGH** - Core business functionality

### Tables to Create:

#### 5. `clients`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- client_type (text: 'individual', 'business')
- company_name (text)
- first_name (text)
- last_name (text)
- contact_person (text)
- email (text)
- phone (text)
- phone_secondary (text)
- address (text)
- city (text)
- state (text)
- zip_code (text)
- country (text)
- industry (text)
- referral_source (text)
- preferred_communication (text)
- status (text: 'new_lead', 'attempted_contact', 'contacted', 'estimate', 'won', 'lost')
- notes (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 6. `projects`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- client_id (uuid, FK to clients)
- title (text)
- description (text)
- status (text: 'planning', 'active', 'on_hold', 'completed', 'cancelled')
- estimated_cost (decimal)
- actual_cost (decimal)
- start_date (date)
- end_date (date)
- assigned_to (uuid, FK to users)
- parent_project_id (uuid, FK to projects) -- for sub-projects
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 7. `communications`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- project_id (uuid, FK to projects, nullable)
- client_id (uuid, FK to clients, nullable)
- user_email (text, FK to users.email)
- type (text: 'email', 'call', 'meeting', 'note')
- subject (text)
- content (text)
- direction (text: 'inbound', 'outbound')
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 8. `client_communications`
```sql
- id (uuid, PK)
- client_id (uuid, FK to clients)
- communication_id (uuid, FK to communications)
- created_at (timestamptz)
```

### Indexes:
- clients: business_id, status, email
- projects: business_id, client_id, status, assigned_to
- communications: project_id, client_id, user_email

---

## Phase 3: Financial Management (Week 5-6)
**Priority: HIGH** - Revenue tracking

### Tables to Create:

#### 9. `products_services`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- name (text)
- description (text)
- type (text: 'labor', 'inventory_materials', 'job_supplies', 'non_inventory_materials')
- unit_price (decimal)
- labor_cost (decimal)
- material_cost (decimal)
- unit (text: 'hour', 'each', 'yard', 'sqft', etc.)
- category (text)
- supplier (text)
- hours (decimal)
- barcode (text, unique)
- is_active (boolean)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 10. `invoices`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- client_id (uuid, FK to clients)
- project_id (uuid, FK to projects, nullable)
- invoice_number (text, unique)
- issue_date (date)
- due_date (date)
- status (text: 'draft', 'sent', 'paid', 'overdue', 'cancelled')
- subtotal (decimal)
- tax_rate (decimal)
- tax_amount (decimal)
- total_amount (decimal)
- notes (text)
- line_items (jsonb) -- array of line items
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 11. `invoice_payments`
```sql
- id (uuid, PK)
- invoice_id (uuid, FK to invoices)
- amount (decimal)
- payment_date (date)
- payment_method (text: 'cash', 'check', 'card', 'ach', 'stripe')
- status (text: 'pending', 'completed', 'failed', 'refunded')
- transaction_id (text)
- notes (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 12. `expenses`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- project_id (uuid, FK to projects, nullable)
- category (text)
- description (text)
- amount (decimal)
- date (date)
- receipt_url (text)
- vendor (text)
- created_by (uuid, FK to users)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### Indexes:
- invoices: business_id, client_id, project_id, status, invoice_number
- invoice_payments: invoice_id, status
- expenses: business_id, project_id, date

---

## Phase 4: Estimates & Change Orders (Week 7)
**Priority: MEDIUM**

### Tables to Create:

#### 13. `estimate_requests`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- client_id (uuid, FK to clients, nullable)
- title (text)
- description (text)
- category (text)
- location (text)
- budget_range (text)
- deadline (date)
- status (text: 'open', 'in_progress', 'awarded', 'closed')
- is_public (boolean)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 14. `estimate_bids`
```sql
- id (uuid, PK)
- estimate_request_id (uuid, FK to estimate_requests)
- business_id (uuid, FK to businesses)
- amount (decimal)
- description (text)
- status (text: 'submitted', 'accepted', 'rejected')
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 15. `estimate_approvals`
```sql
- id (uuid, PK)
- estimate_id (uuid) -- references estimate or project
- client_id (uuid, FK to clients)
- approved_by (text) -- client email or name
- approval_date (timestamptz)
- signature_url (text)
- status (text: 'pending', 'approved', 'rejected')
- created_at (timestamptz)
```

#### 16. `change_orders`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- project_id (uuid, FK to projects)
- change_order_number (text, unique)
- description (text)
- reason (text)
- original_amount (decimal)
- change_amount (decimal)
- new_total (decimal)
- status (text: 'draft', 'pending_approval', 'approved', 'rejected')
- approved_by (uuid, FK to users, nullable)
- approved_at (timestamptz, nullable)
- line_items (jsonb)
- created_at (timestamptz)
- updated_at (timestamptz)
```

---

## Phase 5: Time Tracking & Work Logs (Week 8)
**Priority: HIGH** - Employee management

### Tables to Create:

#### 17. `work_logs`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- user_email (text, FK to users.email)
- project_id (uuid, FK to projects)
- start_time (timestamptz)
- end_time (timestamptz, nullable)
- duration_hours (decimal)
- start_location (jsonb) -- {lat, lng, address}
- end_location (jsonb)
- total_mileage (decimal)
- notes (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 18. `user_tasks`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- project_id (uuid, FK to projects)
- title (text)
- description (text)
- status (text: 'pending', 'in_progress', 'completed', 'cancelled')
- priority (text: 'low', 'medium', 'high')
- assigned_to (uuid, FK to users)
- due_date (date)
- completed_at (timestamptz, nullable)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### Indexes:
- work_logs: business_id, user_email, project_id, start_time
- user_tasks: business_id, project_id, assigned_to, status

---

## Phase 6: Calendar & Scheduling (Week 9)
**Priority: MEDIUM**

### Tables to Create:

#### 19. `calendar_events`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- project_id (uuid, FK to projects, nullable)
- title (text)
- description (text)
- start_time (timestamptz)
- end_time (timestamptz)
- location (text)
- attendees (jsonb) -- array of user emails
- created_by (uuid, FK to users)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 20. `time_off_requests`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- user_email (text, FK to users.email)
- start_date (date)
- end_date (date)
- type (text: 'vacation', 'sick', 'personal', 'other')
- status (text: 'pending', 'approved', 'rejected')
- approved_by (uuid, FK to users, nullable)
- notes (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 21. `calendar_blocks`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- user_email (text, FK to users.email)
- start_time (timestamptz)
- end_time (timestamptz)
- reason (text)
- created_at (timestamptz)
```

---

## Phase 7: Assets & Inventory (Week 10)
**Priority: MEDIUM**

### Tables to Create:

#### 22. `assets`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- name (text)
- type (text: 'equipment', 'vehicle', 'tool', 'other')
- status (text: 'available', 'in_use', 'maintenance', 'retired')
- assigned_to (uuid, FK to users, nullable)
- project_id (uuid, FK to projects, nullable)
- purchase_date (date)
- purchase_price (decimal)
- current_value (decimal)
- location (text)
- specifications (jsonb)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 23. `asset_assignment_logs`
```sql
- id (uuid, PK)
- asset_id (uuid, FK to assets)
- assigned_to (uuid, FK to users)
- project_id (uuid, FK to projects, nullable)
- assigned_at (timestamptz)
- returned_at (timestamptz, nullable)
- notes (text)
- created_at (timestamptz)
```

#### 24. `vendor_assets`
```sql
- id (uuid, PK)
- vendor_id (uuid) -- references vendor/integration
- name (text)
- type (text)
- daily_rate (decimal)
- availability (jsonb)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 25. `asset_rentals`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- vendor_asset_id (uuid, FK to vendor_assets)
- project_id (uuid, FK to projects)
- start_date (date)
- end_date (date)
- total_cost (decimal)
- status (text: 'pending', 'active', 'completed', 'cancelled')
- created_at (timestamptz)
- updated_at (timestamptz)
```

---

## Phase 8: HR & Training (Week 11)
**Priority: MEDIUM**

### Tables to Create:

#### 26. `trainings`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- title (text)
- description (text)
- content (text)
- video_url (text)
- duration_minutes (integer)
- category (text)
- is_required (boolean)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 27. `user_training_progress`
```sql
- id (uuid, PK)
- training_id (uuid, FK to trainings)
- user_email (text, FK to users.email)
- status (text: 'not_started', 'in_progress', 'completed')
- progress_percentage (integer)
- completed_at (timestamptz, nullable)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 28. `accreditations`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- user_email (text, FK to users.email)
- license_name (text)
- license_number (text)
- issuing_authority (text)
- issue_date (date)
- expiration_date (date)
- last_notified_date (date, nullable)
- document_url (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 29. `payroll_runs`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- period_start (date)
- period_end (date)
- status (text: 'draft', 'processing', 'completed')
- total_amount (decimal)
- created_by (uuid, FK to users)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 30. `payroll`
```sql
- id (uuid, PK)
- payroll_run_id (uuid, FK to payroll_runs)
- user_email (text, FK to users.email)
- hours_worked (decimal)
- hourly_rate (decimal)
- gross_pay (decimal)
- deductions (jsonb)
- net_pay (decimal)
- created_at (timestamptz)
```

---

## Phase 9: Social Feed & Communication (Week 12)
**Priority: LOW**

### Tables to Create:

#### 31. `posts`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- user_email (text, FK to users.email)
- project_id (uuid, FK to projects, nullable)
- content (text)
- media_urls (jsonb) -- array of URLs
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 32. `post_comments`
```sql
- id (uuid, PK)
- post_id (uuid, FK to posts)
- user_email (text, FK to users.email)
- content (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 33. `post_likes`
```sql
- id (uuid, PK)
- post_id (uuid, FK to posts)
- user_email (text, FK to users.email)
- created_at (timestamptz)
- UNIQUE(post_id, user_email)
```

#### 34. `conversations`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- type (text: 'direct', 'group', 'project')
- project_id (uuid, FK to projects, nullable)
- title (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 35. `conversation_participants`
```sql
- id (uuid, PK)
- conversation_id (uuid, FK to conversations)
- user_email (text, FK to users.email)
- joined_at (timestamptz)
- last_read_at (timestamptz)
- UNIQUE(conversation_id, user_email)
```

#### 36. `messages`
```sql
- id (uuid, PK)
- conversation_id (uuid, FK to conversations)
- user_email (text, FK to users.email)
- content (text)
- message_type (text: 'text', 'file', 'image')
- file_url (text, nullable)
- created_at (timestamptz)
- updated_at (timestamptz)
```

---

## Phase 10: Documents & Contracts (Week 13)
**Priority: MEDIUM**

### Tables to Create:

#### 37. `document_templates`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- name (text)
- type (text: 'invoice', 'estimate', 'contract', 'other')
- content (jsonb) -- template structure
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 38. `project_documents`
```sql
- id (uuid, PK)
- project_id (uuid, FK to projects)
- name (text)
- file_url (text)
- file_type (text)
- uploaded_by (uuid, FK to users)
- created_at (timestamptz)
```

#### 39. `contracts`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- client_id (uuid, FK to clients)
- project_id (uuid, FK to projects, nullable)
- contract_number (text, unique)
- title (text)
- content (text)
- start_date (date)
- end_date (date)
- status (text: 'draft', 'sent', 'signed', 'expired')
- signature_url (text, nullable)
- created_at (timestamptz)
- updated_at (timestamptz)
```

---

## Phase 11: Marketing & Email (Week 14)
**Priority: LOW**

### Tables to Create:

#### 40. `email_campaigns`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- name (text)
- subject (text)
- content (text)
- status (text: 'draft', 'scheduled', 'sending', 'completed')
- scheduled_at (timestamptz, nullable)
- sent_at (timestamptz, nullable)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 41. `email_campaign_recipients`
```sql
- id (uuid, PK)
- campaign_id (uuid, FK to email_campaigns)
- client_id (uuid, FK to clients)
- email (text)
- status (text: 'pending', 'sent', 'opened', 'clicked', 'bounced')
- sent_at (timestamptz, nullable)
- opened_at (timestamptz, nullable)
- created_at (timestamptz)
```

#### 42. `email_unsubscribes`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- email (text)
- reason (text, nullable)
- created_at (timestamptz)
- UNIQUE(business_id, email)
```

---

## Phase 12: Marketplace & Subcontractors (Week 15)
**Priority: LOW**

### Tables to Create:

#### 43. `marketplace_catalogs`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- name (text)
- description (text)
- is_public (boolean)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 44. `marketplace_items`
```sql
- id (uuid, PK)
- catalog_id (uuid, FK to marketplace_catalogs)
- name (text)
- description (text)
- price (decimal)
- category (text)
- image_url (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 45. `marketplace_purchases`
```sql
- id (uuid, PK)
- item_id (uuid, FK to marketplace_items)
- buyer_business_id (uuid, FK to businesses)
- seller_business_id (uuid, FK to businesses)
- quantity (integer)
- total_amount (decimal)
- status (text: 'pending', 'completed', 'cancelled')
- created_at (timestamptz)
```

#### 46. `subcontractor_bids`
```sql
- id (uuid, PK)
- project_id (uuid, FK to projects)
- subcontractor_business_id (uuid, FK to businesses)
- amount (decimal)
- description (text)
- status (text: 'submitted', 'accepted', 'rejected')
- created_at (timestamptz)
```

#### 47. `subcontractor_assignments`
```sql
- id (uuid, PK)
- project_id (uuid, FK to projects)
- subcontractor_business_id (uuid, FK to businesses)
- status (text: 'assigned', 'in_progress', 'completed')
- created_at (timestamptz)
- updated_at (timestamptz)
```

---

## Phase 13: Additional Features (Week 16)
**Priority: LOW**

### Tables to Create:

#### 48. `alerts`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- user_email (text, FK to users.email)
- title (text)
- message (text)
- type (text)
- priority (text: 'low', 'medium', 'high')
- related_id (uuid)
- related_type (text)
- is_read (boolean, default: false)
- created_at (timestamptz)
```

#### 49. `professional_contacts` (Rolodex)
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- first_name (text)
- last_name (text)
- company (text)
- title (text)
- email (text)
- phone (text)
- category (text)
- notes (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 50. `insurance`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- policy_type (text)
- provider (text)
- policy_number (text)
- coverage_amount (decimal)
- start_date (date)
- end_date (date)
- document_url (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 51. `developer_news`
```sql
- id (uuid, PK)
- title (text)
- content (text)
- author (text)
- category (text)
- is_featured (boolean)
- published_at (timestamptz)
- created_at (timestamptz)
```

#### 52. `news_views`
```sql
- id (uuid, PK)
- news_id (uuid, FK to developer_news)
- user_email (text, FK to users.email)
- viewed_at (timestamptz)
```

#### 53. `user_invitations`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- email (text)
- role (text)
- token (text, unique)
- status (text: 'pending', 'accepted', 'expired')
- expires_at (timestamptz)
- created_by (uuid, FK to users)
- created_at (timestamptz)
```

#### 54. `activity_logs`
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- user_email (text, FK to users.email)
- action (text)
- entity_type (text)
- entity_id (uuid)
- details (jsonb)
- created_at (timestamptz)
```

---

## Implementation Guidelines

### Supabase Setup Steps:

1. **Create Supabase Project**
   - Go to supabase.com
   - Create new project
   - Note down: Project URL, anon key, service_role key

2. **Enable Extensions**
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for text search
   ```

3. **Set up Row Level Security (RLS)**
   - Enable RLS on all tables
   - Create policies for each table based on business_id
   - Example policy:
   ```sql
   CREATE POLICY "Users can view own business data"
   ON clients FOR SELECT
   USING (business_id IN (
     SELECT business_id FROM user_businesses 
     WHERE user_id = auth.uid()
   ));
   ```

4. **Create Database Functions**
   - Auto-update `updated_at` triggers
   - Business data isolation functions
   - Notification triggers

5. **Set up Storage Buckets**
   - `documents` - for PDFs, contracts
   - `images` - for avatars, logos, receipts
   - `uploads` - for general file uploads

6. **Create Edge Functions** (for complex operations)
   - PDF generation
   - Email sending
   - Payment processing webhooks
   - Route optimization

### Frontend Integration:

1. **Install Supabase Client**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Create Supabase Client**
   ```javascript
   import { createClient } from '@supabase/supabase-js'
   
   const supabaseUrl = 'YOUR_SUPABASE_URL'
   const supabaseKey = 'YOUR_ANON_KEY'
   export const supabase = createClient(supabaseUrl, supabaseKey)
   ```

3. **Replace Stub APIs**
   - Update `src/api/entities.js` to use Supabase queries
   - Update `src/api/functions.js` to use Edge Functions
   - Update `src/api/integrations.js` for file uploads

### Security Best Practices:

1. **Always use RLS policies**
2. **Never expose service_role key in frontend**
3. **Validate all inputs server-side**
4. **Use Supabase Auth for authentication**
5. **Implement rate limiting on Edge Functions**
6. **Use database constraints and foreign keys**

---

## Estimated Timeline

- **Phase 1-2**: 4 weeks (Foundation + Core CRM)
- **Phase 3-5**: 4 weeks (Financial + Estimates + Time Tracking)
- **Phase 6-8**: 4 weeks (Calendar + Assets + HR)
- **Phase 9-13**: 4 weeks (Social + Documents + Marketing + Additional)

**Total: ~16 weeks (4 months)** for complete implementation

---

## Priority Recommendations

**MVP (Minimum Viable Product) - 8 weeks:**
- Phase 1: Foundation & Auth
- Phase 2: Core CRM
- Phase 3: Financial Management
- Phase 5: Time Tracking

**Full Implementation:**
- Follow all phases sequentially
- Test each phase before moving to next
- Deploy incrementally

---

## Notes

- All tables should have `created_at` and `updated_at` timestamps
- Use UUIDs for all primary keys
- Implement soft deletes where appropriate (add `deleted_at` column)
- Consider adding `archived_at` for historical data
- Use JSONB for flexible schema where needed
- Index frequently queried columns
- Set up database backups
- Monitor query performance

