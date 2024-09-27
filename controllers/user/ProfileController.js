import prisma from "../../db/db.config.js";

class ProfileController {
  
  static async index(req, res) {
    try {
      const userId = req.user.id;
      const user = await prisma.user.findFirst({
        where: {
          id: userId
        }
      })

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.json({ status: 200, user });
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong!" });
    }
  }

  static async update(req, res) {
    try {
      const  id  = req.user.id;
      const updateData = req.body;

      // Update user data
     const updatedData =  await prisma.user.update({
        data: updateData,
        where: { id },
      });
      
      return res.json({
        status: 200,
        message: "User data updated successfully!",
        updatedData
      });
    } catch (error) {
      console.log("Error:", error);
      return res
        .status(500)
        .json({ message: "Something went wrong. Please try again!" });
    }
  }

  static async generalUpdate(req, res) {
    try{
      const updatedData = req.body; 
      const email= req.body.email; 

      const newdata = await prisma.user.update({
        data: updatedData,
        where: {
          email
        }
      })

      return res.json({
        status: 200,
        message: "User data updated successfully!",
        newdata
      });

    }
    catch(err){
      console.log("error" , err); 
      return res.status(500).json(err);
    }
  }

  static async getUserPosts(req, res) {
    try {
        const id = req.user.id;

        const userPosts = await prisma.user.findFirst({
            where: {
                id: id
            }, 
            select: {
              posts: {
                include: {
                  comments: true,
                  likes: true,
                }
              }
            }
        });

        if (!id) {
            return res.status(404).json({
                status: 404,
                message: "User not found"
            });
        }

        return res.status(200).json({
            status: 200,
            userPosts
        });
    } catch (error) {
        console.error("Error fetching userPosts:", error);
        return res.status(500).json({
            status: 500,
            message: "Something went wrong. Please try again."
        });
    }
  }

}

export default ProfileController;