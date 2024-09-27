import vine, { errors } from "@vinejs/vine";
import {loginSchema,  registerSchema } from "../../validations/authValidation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../db/db.config.js";
// import nodemailer from 'nodemailer'
import crypto from 'crypto'

class AuthController {
  
  static async register(req, res) {
    try {
      const body = req.body;
      const validator = vine.compile(registerSchema);
      const payload = await validator.validate(body);
      
      //   * Check if email exist
            const findUser = await prisma.user.findUnique({
            where: {
                email: payload.email
              },
            });
          
                if (findUser) {
                  return res.status(400).json({
                      errors: {
                          email: " email already taken.please use another one.",
                        },
                      });
                }
                 
                //   * Encrypt the password
                const salt = bcrypt.genSaltSync(10);
                payload.password = bcrypt.hashSync(payload.password, salt);

                const user = await prisma.user.create({
                      data: payload,
                });

                return res.json({
                  message: "Signed up successfully.",
                  user
                });

    } catch (error) {
      console.log("The error is", error);
      if (error instanceof errors.E_VALIDATION_ERROR) {
        // console.log(error.messages);
        return res.status(400).json({ errors: error.messages });
      } else {
        return res.status(500).json({
          status: 500,
          message: "Something went wrong.Please try again.",
        });
      }
    }
  }

  static async login(req, res) {
    try {
      const body = req.body;
      const validator = vine.compile(loginSchema);
      const payload = await validator.validate(body);

      

      //   * Find user with email
      const findUser = await prisma.user.findUnique({
        where: {
          email: payload.email 
        },
      });

      if (findUser) {
        if (!bcrypt.compareSync(payload.password, findUser.password)) {
          return res.status(400).json({
            errors: {
              email: "Invalid Credentials.",
            },
          });
        }

        // * Issue token to user
        const payloadData = {
          id: findUser.id,
          name: findUser.name,
          email: findUser.email,
          goals: findUser.goals,
          address: findUser.address,
          image: findUser.image,
        };
        const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
          expiresIn: "365d",
        });

        
        return res.json({
          message: "Logged in",
          token: token,
          payloadData
        });
      }

      return res.status(400).json({
        errors: {
          email: "No user found with this email.",
        },
      });
    } catch (error) {
      console.log("The error is", error);
      if (error instanceof errors.E_VALIDATION_ERROR) {
        // console.log(error.messages);
        return res.status(400).json({ errors: error.messages });
      } else {
        return res.status(500).json({
          status: 500,
          message: "Something went wrong.Please try again.",
        });
      }
    }
  }

  // static async forgetPass(req, res ) {
  //   try {
  //      const email = req.body.email; 

  //      //   * Find user with email
  //     const findUser = await prisma.user.findUnique({
  //       where: {
  //         email: email
  //       },
  //     });

  //     if(findUser){

  //       function generateToken() {
  //         return crypto.randomBytes(32).toString('hex');
  //       }


  //         // Generate a reset token
  //         const token = generateToken();

  //               // Update the user record with the reset token
  //           const updatedUser = await prisma.user.update({
  //             where: { id: findUser.id },
  //             data: { resetToken: token },
  //           });

  //           const transporter = nodemailer.createTransport({
  //             host:'smtp.gmail.com',
  //             auth: {
  //               user: 'ashutoshnautiyal94@gmail.com',
  //               pass: 'junh perg buot nsqy',
  //             },
  //             secure: true,
  //             port: 465, 
  //           });

  //           await new Promise((resolve, reject) => {
  //             // verify connection configuration
  //             transporter.verify(function (error, success) {
  //                 if (error) {
  //                     console.log(error);
  //                     reject(error);
  //                 } else {
  //                     console.log("Server is ready to take our messages");
  //                     resolve(success);
  //                 }
  //             });
  //         });

  //         const mailOptions = {
  //           from: 'ashutoshnautiyal94@gmail.com',
  //           to: email,
  //           subject: 'Password Reset',
  //           text: `Click the following link to reset your password: http://localhost:3000/reset-password/${token}`,
  //         };

  //         await new Promise((resolve, reject) => {
  //           // send mail
  //           transporter.sendMail(mailOptions, (err, info) => {
  //               if (err) {
  //                   console.error(err);
  //                   res.status(500).send('Error sending email');
  //                   reject(err);
  //               } else {
  //                   console.log(info);
  //                   console.log(`Email sent: ${info.response}`);
  //                   res.status(200).send('Check your email for instructions on resetting your password');
  //                   resolve(info);
  //               }
  //           });
  //       });
          
  //         // transporter.sendMail(mailOptions, (error, info) => {
  //         //   if (error) {
  //         //     console.log(error);
  //         //     res.status(500).send('Error sending email');
  //         //   } else {
  //         //     console.log(`Email sent: ${info.response}`);
  //         //     res.status(200).send('Check your email for instructions on resetting your password');
  //         //   }
  //         // }); 
  //     }
  //     else{
  //       return res.json({
  //         message: "no user found with this email"
  //       })
  //     }

  //     return res.json({
  //       message: "mail sent for forgot pass!",
  //     });
      


  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // static async resetPass(req, res){
  //   try {
  //     const {token}  = req.params;
  //     const {newPass } = req.body; 

  //   const user = await prisma.user.findFirst({
  //     where: { resetToken: token },
  //   });

  //   if (!user) {
  //     return res.status(400).json({ message: 'Invalid or expired token' });
  //   }

  //   // Hash the new password
  //   const hashedPassword = await bcrypt.hash(newPass, 10);

  //   // Update the user's password and clear the reset token
  //   const updatedUser = await prisma.user.update({
  //     where: { id: user.id },
  //     data: {
  //       password: hashedPassword,
  //       resetToken: null, // Clear the reset token
  //     },
  //   });

  //   res.status(200).json({ message: 'Password reset successful' });
      
  //   } catch (error) {
  //     return res.json({error})
  //   }
  // }

  // static async updatePassword(req, res) {
  //   try {
  //     const  id  = req.user.id;
  //     const { oldPassword, newPassword } = req.body;

  //      // Find the user in the database
  //       const user = await prisma.user.findUnique({
  //         where: { id: id },
  //       });

  //       if (!user) {
  //         return res.status(404).json({ message: 'User not found' });
  //       }

  //       // Compare the provided old password with the stored password
  //       const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  //       if (!isPasswordValid) {
  //         return res.status(400).json({ message: 'Invalid old password' });
  //       }

  //        // Hash the new password
  //         const hashedPassword = await bcrypt.hash(newPassword, 10);

  //         // Update the user's password in the database
  //         const updatedUser = await prisma.user.update({
  //           where: { id: id },
  //           data: { password: hashedPassword },
  //         });

  //         res.status(200).json({ message: 'Password updated successfully' });
      

  //     return res.status(400).json({
  //       errors: {
  //         email: "No user found with this email.",
  //       },
  //     });
  //   } catch (error) {
  //     console.log("The error is", error);
  //     if (error instanceof errors.E_VALIDATION_ERROR) {
  //       // console.log(error.messages);
  //       return res.status(400).json({ errors: error.messages });
  //     } else {
  //       return res.status(500).json({
  //         status: 500,
  //         message: "Something went wrong.Please try again.",
  //       });
  //     }
  //   }
  // }


}

export default AuthController;