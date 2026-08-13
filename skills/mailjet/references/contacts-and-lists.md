# Contacts and Contact Lists

Required permission: `read` for inspection; `write` for creating, updating, importing, subscribing, unsubscribing, or deleting contact/list state. Every contact/list mutation requires explicit confirmation of the exact target, scope, and action immediately before execution.

## Core resources

- `GET /v3/REST/contact` — list contacts.
- `POST /v3/REST/contact` — create a contact with a unique `Email`.
- `GET /v3/REST/contact/{contact_ID}` — inspect a contact.
- `PUT /v3/REST/contact/{contact_ID}` — update a contact.
- `GET /v3/REST/contactslist` — list contact lists.
- `POST /v3/REST/contactslist` — create a contact list.
- `GET /v3/REST/contactslist/{list_ID}` — inspect a contact list.
- `PUT /v3/REST/contactslist/{list_ID}` — update a contact list.
- `DELETE /v3/REST/contactslist/{list_ID}` — delete a contact list; Mailjet represents deleted lists with `IsDeleted` state.

## Membership and bulk operations

- `POST /v3/REST/contactslist/{list_ID}/managecontact` — add or update one contact’s list membership.
- `POST /v3/REST/contact/{contact_ID}/managecontactslists` — manage one contact across lists.
- `POST /v3/REST/contact/managemanycontacts` — add, remove, or unsubscribe contacts across lists; returns a `JobID`.
- `GET /v3/REST/contact/managemanycontacts/{job_ID}` — inspect a submitted bulk job.
- `POST /v3/REST/contactslist/{list_ID}/managemanycontacts` — bulk membership changes for one list; returns a `JobID`.
- `GET /v3/REST/contactslist/{list_ID}/managemanycontacts/{job_ID}` — inspect a submitted one-list bulk job.
- `POST /v3/REST/contactslist/{list_ID}/importlist` — import membership changes from another list; returns a `JobID`.
- `GET /v3/REST/contactslist/{list_ID}/importlist/{job_ID}` — inspect a submitted list-import job.

Mailjet distinguishes adding, removing, and unsubscribing. Resolve the exact action, source set, destination list, contact properties, and exclusion state before mutation. If custom properties are supplied, confirm that those properties already exist in Mailjet’s contact metadata.

## Workflow

1. Resolve the exact contact or list IDs, action, source data, destination list, and requested fields.
   Completion: the target set and operation are concrete.
2. Validate email uniqueness, list scope, action, and body schema against the linked official reference. For bulk work, confirm the source file or contact set.
   Completion: the request body and complete scope are validated without exposing unnecessary contact data.
3. For a create, update, import, subscription change, or delete, obtain explicit confirmation immediately before the request.
   Completion: confirmation names the exact contact/list target, scope, and action, or the operation is paused.
4. Read the object back or poll the returned `JobID`. Report counts, `IsDeleted`, membership action, job state, and errors.
   Completion: the observed post-write state or precise API failure is reported.

Keep contact properties and email addresses out of output unless necessary; mask addresses and omit unrelated contacts.

Official references: [Contact](https://dev.mailjet.com/email/reference/contacts/contact/), [Contact List](https://dev.mailjet.com/email/reference/contacts/contact-list/), [Subscriptions](https://dev.mailjet.com/email/reference/contacts/subscriptions/), and [Bulk Contact Management](https://dev.mailjet.com/email/reference/contacts/bulk-contact-management/).
