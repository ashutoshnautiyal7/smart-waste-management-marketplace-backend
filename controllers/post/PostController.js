import cookieParser from "cookie-parser";
import prisma from "../../db/db.config.js";
import jwt from "jsonwebtoken";



class PostController {

  static async getAllPosts(req, res) {
    try {

      // // Get the authorization header from the request
      const authHeader = req.headers.authorization;

      // // If no authorization header is present, return a 401 Unauthorized response
      if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.split(" ")[1];
      // const token = req.cookies.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const { id: userId } = decoded;

        const page = parseInt(req.query.page) || 1;

        const limit = 10;

        const skip = (page - 1) * limit;

     
      // Create the post in the database
      const posts = await prisma.post.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              image: true,
              phone: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const formattedPosts = posts.map(post => {
      

        const formattedName =post.user.name;
        const userImage = post.user.image; 
      
        return {
          ...post,
          size: posts.size,
          user: formattedName,
          userImage : userImage,
        };
      });

      const size = await prisma.post.count();

      return res.status(201).json({ message: "Fetched all posts successfully!", size: size, formattedPosts });
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.error("[POST_CREATE]", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async getAllPostsForUser(req, res) {
    try {

      // Get the authorization header from the request
      const authHeader = req.headers.authorization;

      // If no authorization header is present, return a 401 Unauthorized response
      if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const { id: userId } = decoded;

      const page = parseInt(req.query.page) || 1;

      const limit = 10;

      const skip = (page - 1) * limit;


     
      // Create the post in the database
      const posts = await prisma.post.findMany({
        skip,
        take: limit,
        where: {
            userId: userId,
        },
        include: {
          comments: {
              select: {
                id:true,
                  userId: true,
                  user: {
                    select: {
                      name: true,
                    }
                  },
                  content: true
              },
              orderBy: {
                createdAt: 'desc'
              }
          }, 
          likes: {
            select:{
              userId: true,
            }
          }
       }
      });

      const formattedPosts = posts.map(post => {
        const formattedComments = post.comments.map(comment => ({
          userId: comment.userId,
          username: comment.user.name,
          content: comment.content,
          commentId: comment.id
         
        }));
      
        return {
          ...post,
          comments: formattedComments
        };
      });

      return res.status(201).json({ message: "Fetched all posts successfully!", formattedPosts });
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.error("[POST_CREATE]", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async createPost(req, res) {
    try {

      // Get the authorization header from the request
      const authHeader = req.headers.authorization;

      // If no authorization header is present, return a 401 Unauthorized response
      if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const { id: userId } = decoded;

      const { title, content, images = [], price, address, city, wasteCategory } = req.body;

      // Create the post in the database
      const post = await prisma.post.create({
        data: {
          title,
          content,
          images,
          userId,
          price, 
          address, 
          city,
          wasteCategory
        },
      });

      return res.status(201).json({ message: "Post created successfully!", data: post });
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.error("[POST_CREATE]", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }


  // not done ye

  static async updatePost(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { id: userId } = decoded;
      const { postId, title, content, images } = req.body;

      // Check if the post exists and if the user is the owner
      const post = await prisma.post.findFirst({
        where: {
          id: postId,
          userId,
        },
      });

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Update the post
      const updatedPost = await prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          title,
          content,
          images,
        },
      });

      return res.status(200).json({ message: "Post updated successfully!", data: updatedPost });
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.error("[POST_UPDATE]", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async deletePost(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { id: userId } = decoded;
      const { postId } = req.body;

      // Check if the post exists and if the user is the owner
      const post = await prisma.post.findFirst({
        where: {
          id: postId,
          userId,
        },
      });

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

       // Delete all comments associated with the post
       await prisma.comment.deleteMany({
        where: {
            postId,
        },
    });

    // Delete all likes associated with the post
    await prisma.like.deleteMany({
      where: {
          postId,
      },
  });

      // Delete the post
      await prisma.post.delete({
        where: {
          id: postId,
        },
      });

      return res.status(200).json({ message: "Post deleted successfully!" });
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.error("[POST_DELETE]", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async likePost(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { id: userId } = decoded;
      const { postId } = req.body;

      // Check if the user has already liked the post
      const existingLike = await prisma.like.findFirst({
        where: {
          postId,
          userId,
        },
      });

      if (existingLike) {
        // User has already liked the post, so we'll unlike it
        await prisma.like.delete({
          where: {
            id: existingLike.id,
          },
        });

        // Decrement the like count for the post
         const updatedPost = await prisma.post.update({
          where: {
            id: postId,
          },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
        });

        return res.status(200).json({ message: "Post unliked successfully!" , updatedPost});
      }

// Use an atomic update operation to create the like and increment the likeCount
    const updatedPost = await prisma.post.update({
    where: {
      id: postId,
    },
    data: {
      likes: {
        create: {
          userId,
        },
      },
      likeCount: {
        increment: 1,
      },
    },
    include: {
      likes: true,
    },
  });

      return res.status(201).json({ message: "Post liked successfully!", data: updatedPost });
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.error("[POST_LIKE]", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async createComment(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { id: userId } = decoded;
      const { postId, content } = req.body;

      // Check if the post exists
      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
      });

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Create the comment
      const comment = await prisma.comment.create({
        data: {
          content,
          postId,
          userId,
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
  
  static async deleteComment(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { id: userId } = decoded;
      const { commentId } = req.body;


        // Validate commentId
        if (!commentId) {
          return res.status(400).json({ message: "Comment ID is required" });
      }

      // Check if the comment exists and if the user is the owner
      const comment = await prisma.comment.findFirst({
        where: {
          id: commentId,
          userId,
        },
      });

      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      // Delete the comment
      await prisma.comment.delete({
        where: {
          id: commentId,
        },
      });

      return res.status(200).json({ message: "Comment deleted successfully!" });
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.error("[POST_COMMENT_DELETE]", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default PostController;