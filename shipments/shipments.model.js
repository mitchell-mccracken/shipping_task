/**
 * models/Shipment.js
 * 
 * TODO:
 * - Complete this file according to the specifications in the README
 */

 const mongoose = require('mongoose');

 const ShipmentSchema = new mongoose.Schema({
    orderId : {type: String},
    identifier : { type: String, required: true},
    contents : { type: Array, required: true},
    shipped : { type: Boolean, default: false}
 });
 
 const ShipmentModel = mongoose.model('shipment', ShipmentSchema);
 module.exports = ShipmentModel;

