const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

// Route to create a new payment
router.post('/', paymentController.createPayment);

//Route to get all the payments
router.get('/', paymentController.getAllPayments);
//Route to update and delete the payment
router.put('/:paymentId', paymentController.updatePayment);
router.delete('/:paymentId', paymentController.deletePayment);

module.exports = router;
