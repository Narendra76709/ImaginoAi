import userModel from '../models/useModel.js';
import transactionModel from '../models/transactionModel.js'; // ✅ Make sure this path is correct
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';


// ✅ Razorpay Instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: 'Missing Details' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({ name, email, password: hashedPassword });
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token, user: { name: user.name } });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: 'User does not exist' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token, user: { name: user.name } });
    } else {
      return res.json({ success: false, message: 'Invalid Credentials' });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const userCredits = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, credits: user.creditBalance, user: { name: user.name } });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

const paymentRazorpay = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id; 

    if (!userId || !planId) {
      return res.json({ success: false, message: 'Missing Details' });
    }

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.json({ success: false, message: 'User not found' });
    }

    let plan, credits, amount;

    switch (planId) {
      case 'Basic':
        plan = 'Basic';
        credits = 100;
        amount = 10;
        break;
      case 'Advanced':
        plan = 'Advanced';
        credits = 500;
        amount = 50;
        break;
      case 'Bussiness':
        plan = 'Bussiness';
        credits = 1000;
        amount = 250;
        break;
      default:
        return res.json({ success: false, message: 'Invalid plan ID' });
    }

    const date = Date.now();

    const transactionData = {
      userId,
      plan,
      amount,
      credits,
      date,
    };

    const newTransaction = await transactionModel.create(transactionData);

    const options = {
      amount: amount * 100, // amount in paisa
      currency: process.env.CURRENCY || 'INR',
      receipt: newTransaction._id,
    };

    await razorpayInstance.orders.create(options, (error, order) => {
      if (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
      }
      res.json({ success: true, order });
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === 'paid') {
      const transactionData = await transactionModel.findById(orderInfo.receipt);

      if (!transactionData || transactionData.payment) {
        return res.json({ success: false, message: 'Invalid or already processed transaction' });
      }

      const userData = await userModel.findById(transactionData.userId);
      if (!userData) {
        return res.json({ success: false, message: 'User not found' });
      }

      const newBalance = (userData.creditBalance || 0) + transactionData.credits;

      await userModel.findByIdAndUpdate(userData._id, { creditBalance: newBalance });
      await transactionModel.findByIdAndUpdate(transactionData._id, { payment: true });

      return res.json({ success: true, message: 'Credits added successfully' });
    } else {
      return res.json({ success: false, message: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.json({ success: false, message: error.message });
  }
};

export { registerUser, loginUser, userCredits, paymentRazorpay, verifyRazorpay };
