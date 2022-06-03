const Admins = require('../models/AdminSchema')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const URL = "http://localhost:8080"


// Sign Up Admin
const SignUpAdmin = async (req, res) => {
    const {email , password  , username } = req.body;

    if (!email || !password || !username) {
        return res.json({
            success: false,
            message: "Please Provide All Credientials"
        });
    } else {
        // if admin already exists
        const isExist = await Admins.findOne({
            email: email
        })
        if (isExist) {
            return res.json({
                success: false,
                message : "Admin Already Exists With Same Email"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10); // hashing password

        const newAdmin = new Admins({
            ...req.body,
            password: hashedPassword
        })

        try {
            await newAdmin.save();

            res.status(201).json({
                succes: true,
                message: 'Admin SuccessFully Signed Up'
            })
        } catch (error) {
            console.log("Error in SignUpAdmin and error is : ", error)
            res.status(201).json({
                success: false,
            })
        }
    }
}

// Logging In Admin
const LogInAdmin = async (req, res) => {
    const {email , password } = req.body

    if (!email || !password) {
        return res.json({
            success: false,
            message: "Please Provide All Credediantials"
        })
    } else {
        try {
            const isExist = await Admins.findOne({
                email: email
            });

            if (!isExist) {
                return res.json({
                    success: false,
                    message: "Admin Not Found"
                })
            }

            const isPasswordCorrect = await bcrypt.compare(password, isExist.password); // comparing password
            if (!isPasswordCorrect) {
                return res.json({
                    message: 'Invalid Credientials'
                })
            }

            const token = jwt.sign({id: isExist._id} , JWT_SECRET_KEY , {expiresIn: '24h'}); // gentating token

            return res.json({
                Admin: {
                    Id: isExist._id,
                    Name: isExist.username,
                    Email: isExist.email,
                    Cash: isExist.availCash
                },
                success: true,
                token
            });
        } catch (error) {
            console.log("Error in LogInAdmin and error is : ", error)
            return res.json({
                success: false,
            });
        }
    }

}

// cgeck avail balance
const checkBalance = async (req, res) => {
    const {
        id
    } = req.params

    if (!id) {
        return res.status(504).json({
            success: false,
            message: 'Id is Required'
        })
    } else {
        const isExist = await Admins.findById('62172e83ac64595d8551c15a')
        if (!isExist) {
            return res.status(201).json({
                success: false,
                message: 'Admin Id is Incorrect '
            })
        } else {
            try {
                res.status(201).json({
                    success: true,
                    Balance: isExist.availCash
                })

            } catch (error) {
                console.log("Error in checkBalance and error is : ", error)
                return res.status(504).json({
                    success: false
                })
            }
        }
    }
}



module.exports = {
    SignUpAdmin,
    LogInAdmin,
    checkBalance,
}