# Database Tables Summary - Quick Reference

## Total Tables: 54

### Phase 1: Foundation (4 tables)
1. `users` - User profiles
2. `businesses` - Business/organization data
3. `user_businesses` - User-Business relationship
4. `business_settings` - Business configuration

### Phase 2: Core CRM (4 tables)
5. `clients` - Client/customer data
6. `projects` - Project management
7. `communications` - General communications
8. `client_communications` - Client-specific communications

### Phase 3: Financial (4 tables)
9. `products_services` - Products and services catalog
10. `invoices` - Invoice management
11. `invoice_payments` - Payment tracking
12. `expenses` - Expense tracking

### Phase 4: Estimates (4 tables)
13. `estimate_requests` - Bid requests
14. `estimate_bids` - Submitted bids
15. `estimate_approvals` - Estimate approvals
16. `change_orders` - Change order management

### Phase 5: Time Tracking (2 tables)
17. `work_logs` - Time tracking/clock in-out
18. `user_tasks` - Task management

### Phase 6: Calendar (3 tables)
19. `calendar_events` - Calendar events
20. `time_off_requests` - Time off management
21. `calendar_blocks` - Calendar availability blocks

### Phase 7: Assets (4 tables)
22. `assets` - Company assets
23. `asset_assignment_logs` - Asset assignment history
24. `vendor_assets` - Vendor rental assets
25. `asset_rentals` - Asset rental tracking

### Phase 8: HR & Training (5 tables)
26. `trainings` - Training content
27. `user_training_progress` - Training progress tracking
28. `accreditations` - Licenses and certifications
29. `payroll_runs` - Payroll periods
30. `payroll` - Individual payroll records

### Phase 9: Social & Messaging (6 tables)
31. `posts` - Social feed posts
32. `post_comments` - Post comments
33. `post_likes` - Post likes
34. `conversations` - Messaging conversations
35. `conversation_participants` - Conversation members
36. `messages` - Individual messages

### Phase 10: Documents (3 tables)
37. `document_templates` - Document templates
38. `project_documents` - Project file attachments
39. `contracts` - Contract management

### Phase 11: Marketing (3 tables)
40. `email_campaigns` - Email marketing campaigns
41. `email_campaign_recipients` - Campaign recipients
42. `email_unsubscribes` - Unsubscribe list

### Phase 12: Marketplace (5 tables)
43. `marketplace_catalogs` - Marketplace catalogs
44. `marketplace_items` - Marketplace products
45. `marketplace_purchases` - Purchase records
46. `subcontractor_bids` - Subcontractor bids
47. `subcontractor_assignments` - Subcontractor assignments

### Phase 13: Additional (7 tables)
48. `alerts` - System alerts/notifications
49. `professional_contacts` - Rolodex/contacts
50. `insurance` - Insurance policies
51. `developer_news` - News/blog posts
52. `news_views` - News view tracking
53. `user_invitations` - User invitation system
54. `activity_logs` - Activity audit log

---

## Key Relationships

### Core Relationships:
- `users` ↔ `user_businesses` ↔ `businesses` (Many-to-Many)
- `clients` → `projects` (One-to-Many)
- `projects` → `work_logs` (One-to-Many)
- `projects` → `invoices` (One-to-Many)
- `invoices` → `invoice_payments` (One-to-Many)
- `users` → `work_logs` (One-to-Many via email)
- `projects` → `user_tasks` (One-to-Many)

### All tables include:
- `business_id` (FK to businesses) - for multi-tenancy
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

---

## MVP Tables (Minimum Viable Product)
**Total: 18 tables**

1. users
2. businesses
3. user_businesses
4. business_settings
5. clients
6. projects
7. communications
8. products_services
9. invoices
10. invoice_payments
11. expenses
12. work_logs
13. user_tasks
14. calendar_events
15. assets
16. trainings
17. user_training_progress
18. alerts

---

## Indexes Required (High Priority)

```sql
-- Clients
CREATE INDEX idx_clients_business_id ON clients(business_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_email ON clients(email);

-- Projects
CREATE INDEX idx_projects_business_id ON projects(business_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_assigned_to ON projects(assigned_to);

-- Invoices
CREATE INDEX idx_invoices_business_id ON invoices(business_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);

-- Work Logs
CREATE INDEX idx_work_logs_user_email ON work_logs(user_email);
CREATE INDEX idx_work_logs_project_id ON work_logs(project_id);
CREATE INDEX idx_work_logs_start_time ON work_logs(start_time);

-- Tasks
CREATE INDEX idx_user_tasks_assigned_to ON user_tasks(assigned_to);
CREATE INDEX idx_user_tasks_status ON user_tasks(status);
CREATE INDEX idx_user_tasks_due_date ON user_tasks(due_date);
```

---

## Supabase Storage Buckets

1. **documents** - PDFs, contracts, invoices
2. **images** - Avatars, logos, receipts
3. **uploads** - General file uploads
4. **templates** - Document templates

---

## Edge Functions Required

1. `generate-invoice-pdf` - Generate PDF invoices
2. `generate-estimate-pdf` - Generate PDF estimates
3. `send-email` - Email sending service
4. `stripe-webhook` - Payment processing
5. `optimize-route` - Route optimization
6. `generate-insights` - Business insights generation

