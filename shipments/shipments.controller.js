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
 
 async function getShipments(req, res){
   try{
     let allShipments = await ShipmentModel.find({})
     console.log(allShipments)
     res.send(allShipments)
   } catch (error) {
     console.log('an error has occured')
     console.log(error)
     res.sendStatus(400)
   }
 }

 async function createShipment(req, res){
   try{
     let createdShipment = await ShipmentModel.create(req.body)
     console.log(createdShipment)
     res.sendStatus(200)
   } catch (error) {
     console.log(error)
     res.sendStatus(400)
   }
 }
 
 async function editShipment(req, res){
   try {
     let foundShipment = await ShipmentModel.findById(req.body._id)
     if (foundShipment.shipped){
       console.log('Shipment has already shipped and cannot be edited.')
       res.send('Shipment has already shipped and cannot be edited.')
     } else {
       let updatedShipment = await ShipmentModel.findByIdAndUpdate(req.body._id, req.body.update, {new:true})
       console.log(updatedShipment)
       res.sendStatus(200)
     }
   } catch (error){
     console.log(error)
     res.sendStatus(400)
   }
 }
 
 async function deleteShipment(req, res) {
   try{
     let shipment = await ShipmentModel.findById(req.body.shipmentId)
     if (shipment.shipped){
      console.log('Shipment has already been shipped! Cannot delete')
      res.send('Shipment has already shipped and cannot be deleted.')
     } else {
       let deletedShipment = await ShipmentModel.findByIdAndRemove(req.body.shipmentId)
       console.log(deletedShipment)
       res.sendStatus(200)
     }
   } catch (error){
     console.log(error)
   }
 }
 
//****** OLD CODE COMMENTED OUT AND LEFT FOR REFERENCE ******//
 // I set this function as best I could per the instructions in the README.md and postman_endpoints.json files. I was thinking a more ideal approach would be to update a qtyShipped field for each eitem under the OrdersModel each time a shipment was created. Then we could validate the input for each item on the shipment vs how many are left to ship to make sure someone wasn't incorrectly marking more shipped than what was on the order and this function could be as simple as filtering all the orders. 
//  async function getShipmentQueue(req, res) {
//    let uri = process.env.DB_URI
//    client = new MongoClient(uri)
   
//   try {
//     await client.connect()
//     const allOrders = await client.db('cp-shipping-task').collection('orders')
//     const orders = await allOrders.find().toArray()
//     for (i of orders) {
//       i['completed'] = false      //create a way to track if order has been completed (all items shipped)    
//       for (item of i.items) {
//         item['shipQty'] = 0
//       }
//     }
  
//     let allShipments = await ShipmentModel.find({})     //get all shipments from db
//     let shipments = {}
//     for (shipment of allShipments) {            //this is the start to filter which orders have been filled, shipments will have key value pair where the key is the orderID, this is to make it easier to look up values and combind qtys from multiple shipments
//       let oID = shipment.orderId
//       if (!shipments[oID]) {                //if key is not in shipments, add it
//         shipments[oID] = {}
//       } 

//       for (item of shipment.contents) {     //tally shipped qtys over multiple shipments
//         let pn = item.part
//         let qty = item.qty
//         if (shipments[oID][pn]){
//           shipments[oID][pn] += qty
//         } else {
//           shipments[oID][pn] = qty
//         }
//       }
//     }

//     for (id in shipments) {                 //compare shipped qtys vs order qtys
//       for (order of orders){
//         let orderId = order._id.toString()
//         if (orderId === id) {               //make sure ids match
//           let filled = false
//           let orderItems = order.items
//           let shipmentItems = shipments[id]

//           for (lineItem of orderItems) {               
//             if (orderItems.length !== Object.keys(shipmentItems).length) {        //break out of loop immediately (but not before updating shipQty count) if # of shipment items do not match # order items
//               filled = false
//               for (spn in shipmentItems) {
//                 if (lineItem.part ===spn) {
//                   lineItem.shipQty = shipmentItems[spn]
//                 }
//               }
//               break
//             }     

//             for (spn in shipmentItems) {

//               //this if statement is to check if the number of line items match the number of shipment items, if they don't match then the order cannot be filled
//               if (lineItem.part === spn){
//                 lineItem.shipQty = shipmentItems[spn]
//                 if (lineItem.qty === shipmentItems[spn]) {
//                   filled = true
//                 } else {
//                   filled = false
//                   break
//                 }
//               }
//             }
//           }
//           order.completed = filled
//         }
//       }
//     }

//     let filtered = []
//     for (order of orders) {               //maybe change this to a .filter() with a filtering function???
//       if (order.completed == false) {
//         filtered.push(order)
//       }
//     }


//     return filtered
//   } catch(err){
//     return err
//   }
//   finally{
//     console.log('--------')
//     res.sendStatus(502)
//   }
//  }






 //my code from after my feedback
 
 async function getShipmentQueue(req, res) {
  try {
    ///////////////////////
    // get all shipments //
    ///////////////////////
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

    ////////////////////////////
    // now get all the orders //
    ////////////////////////////
    let uri = process.env.DB_URI
    // uri = 'notvalid'
    client = new MongoClient(uri)
    let openOrders = []
    await client.connect()
    const allOrders = await client.db('cp-shipping-task').collection('orders')
    const orders = await allOrders.find().toArray()
    await client.close()        //seems to work without this but I added it anyway
    for (i of orders) {
      i['completed'] = false      //create a way to track if order has been completed (all items shipped)    
      for (item of i.items) {
        item['shipQty'] = 0
        if ( shipments[i._id.toString()] ) {                  //I had to first check that there was any shipments for that id before checking the part number, if doing it all at once I would get an error
          if ( shipments[i._id.toString()][item.part] ) {     //If the part number has been shipped it will show up, if so update the item shipQty. I probably could do something where it would default the shipQty to 0 but I decided to not investigate that at the moment
            item['shipQty'] = shipments[i._id.toString()][item.part]
          }
        }
        if (item['shipQty'] !== item['qty']){     //If qtys do not match then append to openOrders array using the format below
          let lineItem = {
            // 'orderID': i._id.toString(),       //I don't think this was a requirement 
            'part': item['part'],
            'qtyOrdered': item['qty'],
            'qtyShipped': item['shipQty']
          }
          openOrders.push(lineItem)
        }
      }
    }

    console.log('open orders sucessfully generated')
    console.log('Number of open line items: ', openOrders.length)
    res.send(openOrders)
  } catch (error){
    console.log('there has been an error')
    console.log(error)
    res.sendStatus(400)
  }
 }