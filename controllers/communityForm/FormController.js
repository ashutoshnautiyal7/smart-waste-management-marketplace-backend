import prisma from "../../db/db.config.js";
import jwt from "jsonwebtoken";


class FormController {

  static async postFormData(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { id: userId, } = decoded;
      const { name, email, contact, purpose } = req.body;

      // Create the comment
      const comment = await prisma.communityForm.create({
        data: {
            name, email, contact, purpose 
        },
      });

      return res.status(201).json({ message: "Comment created successfully!", data: comment });
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.error("[POST_COMMENT]", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  
  static async getFormData(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { id: userId } = decoded;

      // Check if the comment exists and if the user is the owner
      const data = await prisma.communityForm.findMany();

     
      return res.status(200).json({ message: "Forms Fetched successfully!", data });
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.error("[POST_COMMENT_DELETE]", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

}
export default FormController;