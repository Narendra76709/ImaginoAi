import axios from "axios";
import userModel from "../models/useModel.js"; // Check: useModel.js might be a typo
import FormData from 'form-data';

export const generateImage = async (req, res) => {
    try {
        const { prompt } = req.body;
        const userId = req.user.id;


        if (!userId || !prompt) {
            console.log("userId", prompt)
            return res.json({ success: false, message: 'Missing Details' });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (user.creditBalance <= 0) {
            return res.json({
                success: false,
                message: 'No Credit Balance',
                creditBalance: user.creditBalance
            });
        }

        const formData = new FormData();
        formData.append('prompt', prompt);

        const response = await axios.post(
            'https://clipdrop-api.co/text-to-image/v1',
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'x-api-key': process.env.CLIPDROP_API  // ✅ No space after key name
                },
                responseType: 'arraybuffer'
            }
        );

        const base64Image = Buffer.from(response.data, 'binary').toString('base64');
        const resultImage = `data:image/png;base64,${base64Image}`;

        const updatedCreditBalance = user.creditBalance - 1;

        await userModel.findByIdAndUpdate(user._id, {
            creditBalance: updatedCreditBalance
        });

        return res.json({
            success: true,
            message: "Image Generated",
            creditBalance: updatedCreditBalance,
            resultImage
        });

    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
};
