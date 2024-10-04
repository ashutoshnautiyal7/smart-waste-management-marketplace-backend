
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../db/db.config.js";
// import nodemailer from 'nodemailer'
import crypto from 'crypto'

class ErpController {
  
  static async register(req, res) {

     try {
      // Destructure data from the request body
      const { name, category, address, email, phoneNumber, password } = req.body;

      // Validate request body fields
      if (!name || !category || !address || !email || !phoneNumber || !password) {
        return res.status(400).json({ error: "All fields are required." });
      }

      // Check if the email already exists in the database
      const existingCompany = await prisma.company.findUnique({
        where: {
          email: email,
        },
      });

      if (existingCompany) {
        return res.status(400).json({
          error: "A company with this email already exists.",
        });
      }

      // Encrypt the password
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      // Create new company in the database with hashed password
      const newCompany = await prisma.company.create({
        data: {
          name,
          category,       // Category should be one of the enum values
          address,
          email,
          phoneNumber,
          password: hashedPassword,  // Store the encrypted password
        },
      })

      // Send success response with the created company data
      return res.status(201).json({
        message: "Company registered successfully!",
        company: newCompany,
      });

    } catch (error) {
      console.error("The error is", error);

      // Handle errors such as unique constraint violations
      if (error.code === 'P2002') {
        return res.status(400).json({ error: "A company with this email already exists." });
      } else {
        return res.status(500).json({
          message: "Something went wrong, please try again later.",
        });
      }
    }
  }


  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate request body fields
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
      }

      // Find company by email
      const company = await prisma.company.findUnique({
        where: {
          email: email,
        },
      });

      // Check if company exists
      if (!company) {
        return res.status(400).json({
          error: "No company found with this email.",
        });
      }

      // Compare provided password with stored hashed password
      const isPasswordValid = bcrypt.compareSync(password, company.password);

      if (!isPasswordValid) {
        return res.status(400).json({
          error: "Invalid credentials.",
        });
      }

      // Prepare payload data for JWT
      const payloadData = {
        id: company.id,
        name: company.name,
        email: company.email,
        phoneNumber: company.phoneNumber,
        category: company.category,
      };

      // Sign the token with a secret and set expiration time
      const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
        expiresIn: "365d",
      });

      // Return token and company data
      return res.json({
        message: "Logged in successfully",
        token: token,
        company: payloadData,
      });

    } catch (error) {
      console.error("The error is", error);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong. Please try again later.",
      });
    }
  }


}

export default ErpController;