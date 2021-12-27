/**
 * cotrollers/shipments.js
 */

 const express = require('express');
 const router = express.Router();
 const { MongoClient} = require('mongodb')

 const ShipmentModel = require('../shipments/shipments.model')

 
 module.exports = router;
 
 // ---------------------------
 // ---------------------------
 // ROUTES
 // ---------------------------
 // ---------------------------
 
 router.get('/', getShipments);
 router.put('/', createShipment);
 router.patch('/', editShipment);    //had to add the :id
 router.delete('/', deleteShipment);
 
 router.get('/queue', getShipmentQueue);
 
 // ---------------------------
 // ---------------------------
 // CONTROLLER
 // ---------------------------
 // ---------------------------
 
 async function getShipments(req, res) {
   ShipmentModel.find({} , (error , allShipments) => {
     if (error) { 
       console.log(error)
       res.sendStatus(400)
     } else {
      // console.log(allShipments)
      res.sendStatus(502);
      return allShipments
     }
   })
 }
 
 async function createShipment(req, res) {
  ShipmentModel.create(req.body , (error , createdShipment) => {
    console.log(createdShipment)
    if (error) {
      console.log(error)
      res.sendStatus(400)
    } else {
      res.sendStatus(502)
    }
  })
 }
 
 async function editShipment(req, res) {
  // ***THIS IS IF WE WANT TO HAVE THE ID IN THE URL***
  //  ShipmentModel.findByIdAndUpdate(req.params.id, req.body, {new: true} , (error , updatedShipment) => {
  //    console.log(updatedShipment)
  //    if(error) {
  //      console.log(error)
  //    }
  //  } )

  // ***CURRENTLY THIS IS HOW POSTMAN IS SET UP, I'M NOT SURE WHICH IS A BETTER METHOD***
  ShipmentModel.findById(req.body._id, (error, foundShipment) => {
    if (error) {
      console.log(error)
      res.sendStatus(400)       //if id isn't valid
    } else{
      console.log('this is the found shipment \n' , foundShipment)
      if (foundShipment.shipped) {        //check that shipment hasn't been shipped
        console.log('Shipment has already shipped and cannot be edited.')
        res.sendStatus(403)
      } else {
        ShipmentModel.findByIdAndUpdate(req.body._id, req.body.update, {new: true} , (error , updatedShipment) => {
          if(error) {
            console.log(error)
            res.sendStatus(400)
          } else { 
            console.log(updatedShipment) 
            res.sendStatus(502)
          }
          })
      }
    }
  })
 }
 
 async function deleteShipment(req, res) {
  ShipmentModel.findById(req.body.shipmentId, (error , shipment) => {
    if(error){
      console.log('error occured: \n' , error)
      res.sendStatus(400)
    } else {
      if(shipment.shipped) {
        console.log('Shipment has already been shipped! Cannot delete')
        res.sendStatus(403)
      } else {
        ShipmentModel.findByIdAndRemove(req.body.shipmentId, (error , deletedShipment) => {
          if (error) {
            res.sendStatus(400)
          } else {
            console.log(deletedShipment)
            res.sendStatus(200)
          }
        })
      }
    }
  })
 }
 
 // I set this function as best I could per the instructions in the README.md and postman_endpoints.json files. I was thinking a more ideal approach would be to update a qtyShipped field for each eitem under the OrdersModel each time a shipment was created. Then we could validate the input for each item on the shipment vs how many are left to ship to make sure someone wasn't incorrectly marking more shipped than what was on the order and this function could be as simple as filtering all the orders. 
 async function getShipmentQueue(req, res) {
   let uri = process.env.DB_URI
   client = new MongoClient(uri)
   
  try {
    await client.connect()
    const allOrders = await client.db('cp-shipping-task').collection('orders')
    const orders = await allOrders.find().toArray()
    for (i of orders) {
      i['completed'] = false      //create a way to track if order has been completed (all items shipped)    
      for (item of i.items) {
        item['shipQty'] = 0
      }
    }
  
    let allShipments = await ShipmentModel.find({})     //get all shipments from db
    let shipments = {}
    for (shipment of allShipments) {            //this is the start to filter which orders have been filled, shipments will have key value pair where the key is the orderID, this is to make it easier to look up values and combind qtys from multiple shipments
      let oID = shipment.orderId
      if (!shipments[oID]) {                //if key is not in shipments, add it
        shipments[oID] = {}
      } 

      for (item of shipment.contents) {     //tally shipped qtys over multiple shipments
        let pn = item.part
        let qty = item.qty
        if (shipments[oID][pn]){
          shipments[oID][pn] += qty
        } else {
          shipments[oID][pn] = qty
        }
      }
    }

    for (id in shipments) {                 //compare shipped qtys vs order qtys
      for (order of orders){
        let orderId = order._id.toString()
        if (orderId === id) {               //make sure ids match
          let filled = false
          let orderItems = order.items
          let shipmentItems = shipments[id]

          for (lineItem of orderItems) {               
            if (orderItems.length !== Object.keys(shipmentItems).length) {        //break out of loop immediately (but not before updating shipQty count) if # of shipment items do not match # order items
              filled = false
              for (spn in shipmentItems) {
                if (lineItem.part ===spn) {
                  lineItem.shipQty = shipmentItems[spn]
                }
              }
              break
            }     

            for (spn in shipmentItems) {

              //this if statement is to check if the number of line items match the number of shipment items, if they don't match then the order cannot be filled
              if (lineItem.part === spn){
                lineItem.shipQty = shipmentItems[spn]
                if (lineItem.qty === shipmentItems[spn]) {
                  filled = true
                } else {
                  filled = false
                  break
                }
              }
            }
          }
          order.completed = filled
        }
      }
    }

    let filtered = []
    for (order of orders) {               //maybe change this to a .filter() with a filtering function???
      if (order.completed == false) {
        filtered.push(order)
      }
    }


    return filtered
  } catch(err){
    return err
  }
  finally{
    console.log('--------')
    res.sendStatus(502)
  }
 }

