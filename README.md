## API Takehome Challenge - Shipping 

### Context
In many businesses, the final step of a process is delivery of goods.
A generic flow might be the following:

Orders can have multiple items, but items may not all be ready at the same time.

A package should be shipped off before its due date with as many complete items as possible to reduce the number of overdue deliveries.

### Assignment
You are to create an API to handle a robust packing & shipping log with the following specifications:

- Orders (already completed)
  - Each order will have the following fields:
    - A human-readable customerId which is a unique alphabetical code (e.g. Customer 'Astro Botic Commercial' will have customerId ABC)
    - A customerId to relate it to the customer it came from. For the purposes of this exercise, you can ignore this field.
    - An array of items that were ordered along with the quantity ordered of each item.
- Shipments
  - A shipment consiste of the following:
    - A human-readable identifying string (recommended: `<customer id>-SHIP<shipment #>`; e.g. ABC-SHIP-01)
    - Contents of the shipment. This should be an array of parts, along with quantiies shipped. (NOTE: quantity shipped in a shipment may not be the same as qty ordered; it may take several shipments to "fulfill" an order)
  - You should be able to create, edit, delete, or view shipments from packages created.

Shipments can be edited any time but once shipped, packages cannot be edited anymore.

The following endpoint(s) have been completed for you:
- `/reset` Create a randomzied list of orders & items, some of which will be completed (i.e. ready to be packed and shipped). Run this at the start of a trial.

A brief description of all required endpoints is written out in the Postman collection included in this repo. (Import postman_endpoints.json to your Postman environment)

### Required env vars
`DB_URI` your mongoDB connection string. E.g. mongodb://localhost:27017/cp-shipping-task


### Questions
If you have any questions, including if you believe there's a mistake somewhere, contact jose@conturoprototyping.com