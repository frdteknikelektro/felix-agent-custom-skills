# Key Odoo Models

Common model names. Use `ir.model` discovery at runtime for Jala custom modules.

| Model | Name | Common Fields |
|---|---|---|
| `res.partner` | Contacts | `name`, `email`, `phone`, `company_type`, `vat` |
| `sale.order` | Sales Orders | `name`, `partner_id`, `amount_total`, `state`, `date_order` |
| `sale.order.line` | Sales Order Lines | `order_id`, `product_id`, `product_uom_qty`, `price_unit` |
| `account.move` | Journal Entries / Invoices | `name`, `partner_id`, `amount_total`, `move_type`, `state` |
| `account.move.line` | Journal Items | `move_id`, `account_id`, `debit`, `credit`, `partner_id` |
| `purchase.order` | Purchase Orders | `name`, `partner_id`, `amount_total`, `state`, `date_order` |
| `stock.move` | Stock Moves | `product_id`, `product_uom_qty`, `state`, `location_id`, `location_dest_id` |
| `stock.quant` | Stock On Hand | `product_id`, `quantity`, `location_id` |
| `stock.picking` | Transfers | `name`, `picking_type_id`, `state`, `move_ids` |
| `product.product` | Product Variants | `name`, `default_code`, `lst_price`, `qty_available` |
| `product.template` | Product Templates | `name`, `list_price`, `type`, `categ_id` |
| `crm.lead` | CRM Leads/Opportunities | `name`, `partner_id`, `type` (lead/opportunity), `stage_id`, `probability` |
| `hr.employee` | Employees | `name`, `department_id`, `job_id`, `work_email` |
| `hr.attendance` | Attendance | `employee_id`, `check_in`, `check_out` |
| `ir.model` | Model Registry | `model`, `name` |
