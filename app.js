const { randomInt } = require('crypto');
const { json, urlencoded } = require('express');
const express = require('express');
const { model, Schema, connect } = require('mongoose');
const ShipmentModel = require('./shipments/shipments.model');

require('dotenv').config();

const app = express();
app.use( json() );
app.use( urlencoded({ extended: true }) );

// app.use('/shipments', require('./controllers/shipments'));      //This was the original so I commented it out and created a new one
app.use('/shipments', require('./shipments/shipments.controller'))

app.post('/reset', resetAll);

// ---------------------------
// Though it is bad practice to do so, the starter code provided below
// is here to avoid cluttering the rest of your project.
// 
// You should not have to edit any of the code below.
// ---------------------------

const OrderModel = model('orders', new Schema({
  customerId: String,
  orderNumber: String,
  
  items: [{
    part: String,
    qty:  Number,
  }]
}));


/**
 * Drop all collections & populate orders with semi-random data.
 */
async function resetAll(_req, res) {

  console.log('Resetting collections...');

  const _dropCollection = async model => {
    try {
      await model.collection.drop();
      return true;
    }
    catch (e) {
      // collection doesn't exist; ok
      if ( e.name === 'MongoServerError' && e.code === 26 ) {
        return true;
      }
      else {
        console.error(e);
        return false;
      }
    }
  };

  try {
    const ok = [
      await _dropCollection( OrderModel ),
      await _dropCollection( ShipmentModel )
    ];

    if ( ok.some(x => !x) ) return res.status(500).send('Error dropping collections.');

    const promises = [];
    ['ABC', 'BCA', 'CAB'].map(customerId => {
      for (let i = 1; i <= randomInt(1, 10); i++) {
        const orderNumber = 1000 + i;

        const items = [];
        for (let j = 0; j <= randomInt(1, 4); j++) {
          const newItem = {
            part: `PN-0${j+1}`,
            qty: randomInt(1, 10),
            readyToShip: Math.random() < 0.5
          };

          items.push(newItem);
        }

        const newOrder = new OrderModel({
          customerId,
          orderNumber,
          items
        });

        promises.push( newOrder.save() );
      }
    });

    await Promise.all(promises);

    console.log('Collections reset!');

    res.sendStatus(200);
  }
  catch (e) {
    console.error(e);
    res.status(500).send('Error resetting models.');
  }

};

// connect to DB & listen
(async () => {

  try {
    await connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log('API running on ' + port));
  }
  catch (e) {
    console.error(e);
    console.log('Failed to connect to DB. Exiting...');

    process.exit();
  }

})();